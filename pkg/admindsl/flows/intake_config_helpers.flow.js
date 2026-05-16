const helpers = {};

function versionRows(versions) {
  return (versions || []).map(function(version) {
    return {
      id: version.id,
      status: version.status,
      label: version.label,
      activatedAt: version.activatedAt || "—",
      createdAt: version.createdAt || "—"
    };
  });
}

function serviceEditorItems(services) {
  return (services || []).map(function(service) {
    return {
      id: service.id,
      category: service.category,
      value: service.value,
      title: service.title,
      subtitleValue: service.subtitle || "",
      badge: service.badge || "",
      sortOrder: service.sortOrder,
      enabled: service.enabled,
      subtitle: service.category + " · " + service.value + " · " + (service.badge || "No badge") + " · sort " + service.sortOrder + (service.enabled ? "" : " · disabled")
    };
  });
}

function findById(items, id) {
  for (var i = 0; i < (items || []).length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

function parseIntOrZero(value) {
  var parsed = parseInt(String(value || "0"), 10);
  return isNaN(parsed) ? 0 : parsed;
}

function parseOptionalInt(value) {
  var text = String(value == null ? "" : value).trim();
  if (!text) return null;
  var parsed = parseInt(text, 10);
  return isNaN(parsed) ? null : parsed;
}

function parseBool(value) {
  var normalized = String(value || "").toLowerCase().trim();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on" || normalized === "enabled";
}

function toneEditorItems(tones) {
  return (tones || []).map(function(tone) {
    return {
      id: tone.id,
      title: tone.label,
      subtitle: tone.value + " · sort " + tone.sortOrder + (tone.enabled ? "" : " · disabled")
    };
  });
}

function budgetEditorItems(budgets) {
  return (budgets || []).map(function(budget) {
    return {
      id: budget.id,
      title: budget.title,
      subtitle: budget.value + " · " + (budget.subtitle || "No subtitle") + " · sort " + budget.sortOrder + (budget.enabled ? "" : " · disabled")
    };
  });
}

function priceRows(priceRanges) {
  return (priceRanges || []).map(function(range) {
    return {
      id: range.id,
      service: range.serviceValue || "default",
      budget: range.budgetValue || "default",
      label: range.label,
      min: range.minCents ? "$" + Math.round(range.minCents / 100) : "—",
      max: range.maxCents ? "$" + Math.round(range.maxCents / 100) : "—"
    };
  });
}

function timeSlotItems(timeSlots) {
  return (timeSlots || []).map(function(slot) {
    return {
      id: slot.id,
      title: slot.title,
      subtitle: slot.value + " · sort " + slot.sortOrder + (slot.enabled ? "" : " · disabled")
    };
  });
}

function validationChanges(report) {
  const issues = (report && report.issues) || [];
  if (!issues.length) {
    return [{ field: "Validation", before: "Pending review", after: "No blocking issues", tone: "success" }];
  }
  return issues.map(function(issue) {
    return {
      field: issue.entity || issue.severity,
      before: issue.severity,
      after: issue.message,
      tone: issue.severity === "error" ? "danger" : "warn"
    };
  });
}

module.exports = { versionRows, serviceEditorItems, findById, parseIntOrZero, parseOptionalInt, parseBool, toneEditorItems, budgetEditorItems, priceRows, timeSlotItems, validationChanges };
