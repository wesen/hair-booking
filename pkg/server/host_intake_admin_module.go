package server

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dop251/goja"
	"github.com/go-go-golems/hair-booking/pkg/admindsl"
	"github.com/go-go-golems/hair-booking/pkg/intakeadmin"
)

func gojaJSONValue(value any) any {
	payload, err := json.Marshal(value)
	if err != nil {
		return value
	}
	var out any
	if err := json.Unmarshal(payload, &out); err != nil {
		return value
	}
	return out
}

func loadIntakeAdminModule(store *intakeadmin.Store, actor intakeadmin.Actor) admindsl.NativeModuleLoader {
	return func(vm *goja.Runtime, moduleObj *goja.Object) {
		exports := moduleObj.Get("exports").(*goja.Object)
		_ = exports.Set("dashboardStats", func() goja.Value {
			stats, err := store.DashboardStats(context.Background())
			if err != nil {
				panic(vm.ToValue("host/intake-admin.dashboardStats: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(stats))
		})
		_ = exports.Set("listRequests", func(call goja.FunctionCall) goja.Value {
			filters := intakeadmin.RequestFilters{Limit: 50}
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &filters)
			}
			requests, err := store.ListRequests(context.Background(), filters)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.listRequests: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(requests))
		})
		_ = exports.Set("getRequest", func(id string) goja.Value {
			request, err := store.GetRequest(context.Background(), id)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.getRequest: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(request))
		})
		_ = exports.Set("updateRequestStatus", func(id string, status string, note string) goja.Value {
			request, err := store.UpdateRequestStatus(context.Background(), id, status, actor, note)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.updateRequestStatus: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(request))
		})
		_ = exports.Set("listConfigVersions", func() goja.Value {
			versions, err := store.ListConfigVersions(context.Background())
			if err != nil {
				panic(vm.ToValue("host/intake-admin.listConfigVersions: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(versions))
		})
		_ = exports.Set("createDraftFromActive", func(call goja.FunctionCall) goja.Value {
			label := "Admin draft"
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				label = call.Argument(0).String()
			}
			version, err := store.CreateDraftFromActive(context.Background(), label, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.createDraftFromActive: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(version))
		})
		_ = exports.Set("getConfigEditor", func(call goja.FunctionCall) goja.Value {
			configVersionID := ""
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				configVersionID = call.Argument(0).String()
			}
			data, err := store.GetConfigEditorData(context.Background(), configVersionID)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.getConfigEditor: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(data))
		})
		_ = exports.Set("publishConfigVersion", func(id string) goja.Value {
			version, err := store.PublishConfigVersion(context.Background(), id, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.publishConfigVersion: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(version))
		})
		_ = exports.Set("updateServiceOption", func(call goja.FunctionCall) goja.Value {
			var input intakeadmin.ConfigServiceOptionInput
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &input)
			}
			service, err := store.UpdateServiceOption(context.Background(), input, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.updateServiceOption: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(service))
		})
		_ = exports.Set("updateToneOption", func(call goja.FunctionCall) goja.Value {
			var input intakeadmin.ConfigToneOptionInput
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &input)
			}
			tone, err := store.UpdateToneOption(context.Background(), input, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.updateToneOption: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(tone))
		})
		_ = exports.Set("updateBudgetOption", func(call goja.FunctionCall) goja.Value {
			var input intakeadmin.ConfigBudgetOptionInput
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &input)
			}
			budget, err := store.UpdateBudgetOption(context.Background(), input, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.updateBudgetOption: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(budget))
		})
		_ = exports.Set("updatePriceRange", func(call goja.FunctionCall) goja.Value {
			var input intakeadmin.ConfigPriceRangeInput
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &input)
			}
			priceRange, err := store.UpdatePriceRange(context.Background(), input, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.updatePriceRange: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(priceRange))
		})
		_ = exports.Set("updateAvailabilityDay", func(call goja.FunctionCall) goja.Value {
			var input intakeadmin.ConfigAvailabilityDayInput
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &input)
			}
			day, err := store.UpdateAvailabilityDay(context.Background(), input, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.updateAvailabilityDay: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(day))
		})
		_ = exports.Set("updateTimeSlot", func(call goja.FunctionCall) goja.Value {
			var input intakeadmin.ConfigTimeSlotInput
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &input)
			}
			slot, err := store.UpdateTimeSlot(context.Background(), input, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.updateTimeSlot: " + err.Error()))
			}
			return vm.ToValue(gojaJSONValue(slot))
		})
		_ = exports.Set("createConfigEntity", func(call goja.FunctionCall) goja.Value {
			var input intakeadmin.ConfigEntityInput
			if len(call.Arguments) > 0 && !goja.IsUndefined(call.Argument(0)) && !goja.IsNull(call.Argument(0)) {
				payload, _ := json.Marshal(call.Argument(0).Export())
				_ = json.Unmarshal(payload, &input)
			}
			id, err := store.CreateConfigEntity(context.Background(), input, actor)
			if err != nil {
				panic(vm.ToValue("host/intake-admin.createConfigEntity: " + err.Error()))
			}
			return vm.ToValue(map[string]any{"id": id})
		})
		_ = exports.Set("deleteConfigEntity", func(kind string, id string) goja.Value {
			if err := store.DeleteConfigEntity(context.Background(), kind, id, actor); err != nil {
				panic(vm.ToValue("host/intake-admin.deleteConfigEntity: " + err.Error()))
			}
			return vm.ToValue(map[string]any{"ok": true})
		})
	}
}

func loadIntakePreviewModule(store *intakeadmin.Store) admindsl.NativeModuleLoader {
	return func(vm *goja.Runtime, moduleObj *goja.Object) {
		exports := moduleObj.Get("exports").(*goja.Object)
		_ = exports.Set("validateConfig", func(configVersionID string) map[string]any {
			if store == nil || store.ConfigDB == nil {
				return map[string]any{"ok": false, "errors": []string{"config DB is not configured"}}
			}
			var count int
			queryID := configVersionID
			if queryID == "" || queryID == "active" {
				if err := store.ConfigDB.QueryRowContext(context.Background(), `SELECT id FROM dsl_config_versions WHERE status = 'active' ORDER BY activated_at DESC LIMIT 1`).Scan(&queryID); err != nil {
					return map[string]any{"ok": false, "errors": []string{fmt.Sprintf("active config not found: %v", err)}}
				}
			}
			if err := store.ConfigDB.QueryRowContext(context.Background(), `SELECT count(*) FROM dsl_service_options WHERE config_version_id = ? AND enabled = 1`, queryID).Scan(&count); err != nil {
				return map[string]any{"ok": false, "errors": []string{err.Error()}}
			}
			return map[string]any{"ok": count > 0, "configVersionId": queryID, "serviceOptionCount": count}
		})
	}
}
