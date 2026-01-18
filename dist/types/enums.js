"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertPriority = exports.Availability = exports.Priority = exports.Severity = exports.IncidentStatus = exports.ReportStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CITIZEN"] = "CITIZEN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["RESPONDER"] = "RESPONDER";
})(UserRole || (exports.UserRole = UserRole = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["VERIFIED"] = "VERIFIED";
    ReportStatus["REJECTED"] = "REJECTED";
    ReportStatus["RESOLVED"] = "RESOLVED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["NEW"] = "NEW";
    IncidentStatus["ASSIGNED"] = "ASSIGNED";
    IncidentStatus["ON_THE_WAY"] = "ON_THE_WAY";
    IncidentStatus["ON_SITE"] = "ON_SITE";
    IncidentStatus["RESOLVED"] = "RESOLVED";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var Severity;
(function (Severity) {
    Severity["LOW"] = "LOW";
    Severity["MEDIUM"] = "MEDIUM";
    Severity["HIGH"] = "HIGH";
})(Severity || (exports.Severity = Severity = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "LOW";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["HIGH"] = "HIGH";
    Priority["CRITICAL"] = "CRITICAL";
})(Priority || (exports.Priority = Priority = {}));
var Availability;
(function (Availability) {
    Availability["AVAILABLE"] = "AVAILABLE";
    Availability["BUSY"] = "BUSY";
    Availability["OFFLINE"] = "OFFLINE";
})(Availability || (exports.Availability = Availability = {}));
var AlertPriority;
(function (AlertPriority) {
    AlertPriority["INFO"] = "INFO";
    AlertPriority["WARNING"] = "WARNING";
    AlertPriority["CRITICAL"] = "CRITICAL";
})(AlertPriority || (exports.AlertPriority = AlertPriority = {}));
