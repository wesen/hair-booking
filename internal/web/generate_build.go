//go:build ignore

package main

import (
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	repoRoot, err := findRepoRoot()
	if err != nil {
		panic(err)
	}

	uiDir := filepath.Join(repoRoot, "ui")
	publicOut := filepath.Join(repoRoot, "ui", "dist", "public")
	targetDir := filepath.Join(repoRoot, "internal", "web", "embed", "public")

	cmd := exec.Command("bun", "-C", uiDir, "run", "build")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		panic(err)
	}

	if err := os.RemoveAll(targetDir); err != nil {
		panic(err)
	}
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		panic(err)
	}

	if err := copyDir(publicOut, targetDir); err != nil {
		panic(err)
	}

	fmt.Printf("Copied %s -> %s\n", publicOut, targetDir)
}

func findRepoRoot() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}

	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", os.ErrNotExist
		}
		dir = parent
	}
}

func copyDir(src, dst string) error {
	return filepath.WalkDir(src, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		if rel == "." {
			return nil
		}

		target := filepath.Join(dst, rel)
		if d.IsDir() {
			return os.MkdirAll(target, 0o755)
		}

		return copyFile(path, target)
	})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer func() { _ = in.Close() }()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer func() { _ = out.Close() }()

	if _, err := io.Copy(out, in); err != nil {
		return err
	}

	return out.Close()
}
