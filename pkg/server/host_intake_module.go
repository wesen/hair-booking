package server

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dop251/goja"
	"github.com/go-go-golems/hair-booking/pkg/dslgoja"
	"github.com/go-go-golems/hair-booking/pkg/intakeadmin"
)

func loadCustomerIntakeModule(store *intakeadmin.Store, session *dslgoja.FlowSession) dslgoja.NativeModuleLoader {
	return func(vm *goja.Runtime, moduleObj *goja.Object) {
		exports := moduleObj.Get("exports").(*goja.Object)
		_ = exports.Set("createRequest", func(call goja.FunctionCall) goja.Value {
			if store == nil {
				panic(vm.ToValue("host/intake.createRequest: intake admin store is not configured"))
			}
			if len(call.Arguments) == 0 || goja.IsUndefined(call.Argument(0)) || goja.IsNull(call.Argument(0)) {
				panic(vm.ToValue("host/intake.createRequest: request payload is required"))
			}
			var input intakeadmin.RequestInput
			payload, err := json.Marshal(call.Argument(0).Export())
			if err != nil {
				panic(vm.ToValue("host/intake.createRequest: " + err.Error()))
			}
			if err := json.Unmarshal(payload, &input); err != nil {
				panic(vm.ToValue("host/intake.createRequest: " + err.Error()))
			}
			if input.FlowSessionID == "" && session != nil {
				input.FlowSessionID = session.ID
			}
			if input.UserID == "" && session != nil {
				input.UserID = session.User.ID
			}
			request, err := store.CreateRequest(context.Background(), input)
			if err != nil {
				panic(vm.ToValue("host/intake.createRequest: " + err.Error()))
			}
			return vm.ToValue(request)
		})
		_ = exports.Set("dashboardStats", func() goja.Value {
			stats, err := store.DashboardStats(context.Background())
			if err != nil {
				panic(vm.ToValue(fmt.Sprintf("host/intake.dashboardStats: %v", err)))
			}
			return vm.ToValue(stats)
		})
	}
}
