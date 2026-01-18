package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/go-go-golems/XXX/internal/cli"
	"github.com/go-go-golems/XXX/internal/dsl"
)

type restConfig struct {
	baseURL string
	client  *http.Client
}

func newRestCommand() *cobra.Command {
	cfg := &restConfig{
		baseURL: "http://localhost:3001",
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}

	restCmd := &cobra.Command{
		Use:   "rest",
		Short: "Exercise backend over REST",
	}

	restCmd.PersistentFlags().StringVar(&cfg.baseURL, "base-url", cfg.baseURL, "base URL for the API (e.g. http://localhost:3001)")

	restCmd.AddCommand(newRestCreateTreeCommand(cfg))
	restCmd.AddCommand(newRestListTreesCommand(cfg))
	restCmd.AddCommand(newRestGetTreeCommand(cfg))
	restCmd.AddCommand(newRestValidateTreeCommand(cfg))
	restCmd.AddCommand(newRestRunCommand(cfg))

	return restCmd
}

func newRestCreateTreeCommand(cfg *restConfig) *cobra.Command {
	var filePath string
	var name string
	var publish bool

	cmd := &cobra.Command{
		Use:   "create-tree",
		Short: "Create a decision tree over REST",
		RunE: func(cmd *cobra.Command, args []string) error {
			content, err := os.ReadFile(filePath)
			if err != nil {
				return err
			}
			tree, err := dsl.ParseDSL(string(content))
			if err != nil {
				return err
			}
			if name == "" {
				name = tree.Name
			}

			payload := map[string]any{
				"name":        name,
				"dslContent":  string(content),
				"isPublished": publish,
			}
			if err := restDoJSON(cfg, http.MethodPost, "/api/decision-trees", payload, &payload); err != nil {
				return err
			}
			prettyPrint(cmd.OutOrStdout(), payload)
			return nil
		},
	}

	cmd.Flags().StringVar(&filePath, "file", "", "path to DSL yaml file")
	cmd.Flags().StringVar(&name, "name", "", "override decision tree name")
	cmd.Flags().BoolVar(&publish, "publish", false, "publish the decision tree")
	_ = cmd.MarkFlagRequired("file")

	return cmd
}

func newRestListTreesCommand(cfg *restConfig) *cobra.Command {
	var all bool

	cmd := &cobra.Command{
		Use:   "list-trees",
		Short: "List decision trees",
		RunE: func(cmd *cobra.Command, args []string) error {
			path := "/api/decision-trees"
			if all {
				path = "/api/decision-trees/all"
			}
			var response any
			if err := restDoJSON(cfg, http.MethodGet, path, nil, &response); err != nil {
				return err
			}
			prettyPrint(cmd.OutOrStdout(), response)
			return nil
		},
	}

	cmd.Flags().BoolVar(&all, "all", false, "list all trees (including unpublished)")

	return cmd
}

func newRestGetTreeCommand(cfg *restConfig) *cobra.Command {
	var id int64

	cmd := &cobra.Command{
		Use:   "get-tree",
		Short: "Get a decision tree by ID",
		RunE: func(cmd *cobra.Command, args []string) error {
			var response any
			if err := restDoJSON(cfg, http.MethodGet, fmt.Sprintf("/api/decision-trees/%d", id), nil, &response); err != nil {
				return err
			}
			prettyPrint(cmd.OutOrStdout(), response)
			return nil
		},
	}

	cmd.Flags().Int64Var(&id, "id", 0, "decision tree ID")
	_ = cmd.MarkFlagRequired("id")

	return cmd
}

func newRestValidateTreeCommand(cfg *restConfig) *cobra.Command {
	var filePath string

	cmd := &cobra.Command{
		Use:   "validate",
		Short: "Validate a DSL document over REST",
		RunE: func(cmd *cobra.Command, args []string) error {
			content, err := os.ReadFile(filePath)
			if err != nil {
				return err
			}
			payload := map[string]any{"dslContent": string(content)}
			var response any
			if err := restDoJSON(cfg, http.MethodPost, "/api/decision-trees/validate", payload, &response); err != nil {
				return err
			}
			prettyPrint(cmd.OutOrStdout(), response)
			return nil
		},
	}

	cmd.Flags().StringVar(&filePath, "file", "", "path to DSL yaml file")
	_ = cmd.MarkFlagRequired("file")

	return cmd
}

func newRestRunCommand(cfg *restConfig) *cobra.Command {
	var treeID int64
	var selections []string

	cmd := &cobra.Command{
		Use:   "run",
		Short: "Fetch a tree and create a booking run over REST",
		RunE: func(cmd *cobra.Command, args []string) error {
			var treeResp struct {
				ID         int64  `json:"id"`
				DSLContent string `json:"dslContent"`
				Name       string `json:"name"`
			}
			if err := restDoJSON(cfg, http.MethodGet, fmt.Sprintf("/api/decision-trees/%d", treeID), nil, &treeResp); err != nil {
				return err
			}

			tree, err := dsl.ParseDSL(treeResp.DSLContent)
			if err != nil {
				return err
			}

			state, err := cli.RunSelections(tree, selections)
			if err != nil {
				return err
			}

			selectedBytes, err := json.Marshal(state.Selected)
			if err != nil {
				return err
			}

			payload := map[string]any{
				"decisionTreeId":   treeID,
				"selectedServices": string(selectedBytes),
				"totalPrice":       state.TotalPrice,
				"totalDuration":    state.TotalDuration,
				"appliedRules":     strings.Join(state.AppliedRules, "; "),
			}
			var response any
			if err := restDoJSON(cfg, http.MethodPost, "/api/bookings", payload, &response); err != nil {
				return err
			}

			prettyPrint(cmd.OutOrStdout(), map[string]any{
				"tree":    treeResp.Name,
				"state":   state,
				"booking": response,
			})
			return nil
		},
	}

	cmd.Flags().Int64Var(&treeID, "tree-id", 0, "decision tree ID")
	cmd.Flags().StringArrayVar(&selections, "select", nil, "option labels to select in order")
	_ = cmd.MarkFlagRequired("tree-id")
	_ = cmd.MarkFlagRequired("select")

	return cmd
}

func restDoJSON(cfg *restConfig, method, path string, body any, out any) error {
	url := strings.TrimRight(cfg.baseURL, "/") + path

	var reader io.Reader
	if body != nil {
		payload, err := json.Marshal(body)
		if err != nil {
			return err
		}
		reader = bytes.NewReader(payload)
	}

	req, err := http.NewRequest(method, url, reader)
	if err != nil {
		return err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := cfg.client.Do(req)
	if err != nil {
		return err
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= 400 {
		data, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("request failed (%d): %s", resp.StatusCode, strings.TrimSpace(string(data)))
	}

	if out == nil {
		return nil
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

func prettyPrint(w io.Writer, payload any) {
	data, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		fmt.Fprintln(w, payload)
		return
	}
	fmt.Fprintln(w, string(data))
}
