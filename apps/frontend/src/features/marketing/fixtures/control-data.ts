export const AUDIT = [
    { 
        at: "14:02:11", 
        actor: "causolve.agent",
        event: "Recommendation created: shift traffic to secondary provider"
    },
    { 
        at: "14:02:11", 
        actor: "causolve.policy",
        event: "Policy matched: medium-risk traffic shift requires incident_commander"
    },
    { 
        at: "14:02:19", 
        actor: "j.doe", 
        event: "Opened approval request, reviewed 6 evidence items" 
    },
];

export const GATES = [
    { 
        role: "responder", 
        label: "Responder", 
        allowed: "Investigate, comment, attach evidence", 
        blocked: "Cannot execute remediation" 
    },
    { 
        role: "incident_commander", 
        label: "Incident commander", 
        allowed: "Approve medium-risk remediation", 
        blocked: "High risk needs second approval" 
    },
    { 
        role: "observer", 
        label: "Observer", 
        allowed: "Read incident and audit trail", 
        blocked: "No write access" 
    },
];

export type Decision = "pending" | "approved" | "rejected";

export const getTrail = (decision: Decision) => {
    let trail: typeof AUDIT;

    switch (decision) {
        case "approved":
            trail = [
                    ...AUDIT, 
                    { 
                        at: "14:02:34", 
                        actor: "j.doe", 
                        event: "Approved traffic shift, scoped to checkout-api"
                    }
                ]
            break;
        case "rejected":
            trail = [
                    ...AUDIT, 
                    { 
                        at: "14:02:34", 
                        actor: "j.doe", 
                        event: "Rejected execution, requested additional provider verification"
                    }
                ]
            break;
        default:
            trail = AUDIT;
    }

    return trail;
}
