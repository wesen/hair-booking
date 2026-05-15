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
