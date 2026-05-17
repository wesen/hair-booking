package admindsl

import (
	"testing"

	"github.com/dop251/goja"
)

func TestGojaModuleExposesControlledHostBuilders(t *testing.T) {
	vm := goja.New()
	if err := vm.Set("adminDsl", GojaModule()); err != nil {
		t.Fatalf("install module: %v", err)
	}
	value, err := vm.RunString(`
		const page = adminDsl.pageResource("services", "Services")
		  .Shell("resource", { active: "services" })
		  .Content(
		    adminDsl.section("Rows", {},
		      adminDsl.resourceList("services", {},
		        adminDsl.resourceRow("cut", { title: "Cut" })
		          .Actions(adminDsl.open("service.select", "Open").Placement("row"))
		      )
		    )
		  )
		  .MustBuild();
		page;
	`)
	if err != nil {
		t.Fatalf("run script: %v", err)
	}
	var page Page
	if err := vm.ExportTo(value, &page); err != nil {
		t.Fatalf("export page: %v", err)
	}
	if err := ValidatePage(page); err != nil {
		t.Fatalf("validate page: %v", err)
	}
	if page.Shell.Kind != ShellResource || page.Nodes[0].Kind != NodeSection {
		t.Fatalf("unexpected page: %#v", page)
	}
}

func TestGojaModuleExposesV2WorkbenchBuilders(t *testing.T) {
	vm := goja.New()
	if err := vm.Set("adminDsl", GojaModule()); err != nil {
		t.Fatalf("install module: %v", err)
	}
	value, err := vm.RunString(`
		const page = adminDsl.pageAdmin("workbench", "Workbench")
		  .SchemaVersion(2)
		  .Shell("admin", { variant: "workbench" })
		  .Content(
		    adminDsl.pageHeader({ title: "Workbench" })
		      .Actions(adminDsl.primary("service.new", "New service").Placement("pageHeader")),
		    adminDsl.dashboardGrid({ columns: { desktop: 12 } },
		      adminDsl.panel("Services", { density: "compact" },
		        adminDsl.resourceTable("services", {
		          columns: [{ id: "name", kind: "text", label: "Name" }],
		          rows: [{ id: "svc_1", name: "Highlights" }]
		        })
		      ),
		      adminDsl.panel("Calendar", {},
		        adminDsl.monthCalendar("calendar", { month: "2024-06" })
		      ),
		      adminDsl.panel("Changes", {},
		        adminDsl.comparisonTable("changes", { rows: [{ id: "price", field: "Price", current: "$200", draft: "$220" }] })
		      )
		    )
		  )
		  .MustBuild();
		page;
	`)
	if err != nil {
		t.Fatalf("run script: %v", err)
	}
	var page Page
	if err := vm.ExportTo(value, &page); err != nil {
		t.Fatalf("export page: %v", err)
	}
	if err := ValidatePage(page); err != nil {
		t.Fatalf("validate page: %v", err)
	}
	if page.SchemaVersion != 2 || page.Nodes[0].Kind != NodePageHeader || page.Nodes[1].Kind != NodeDashboardGrid {
		t.Fatalf("unexpected v2 page: %#v", page)
	}
}
