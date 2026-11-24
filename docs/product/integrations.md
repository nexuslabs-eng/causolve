# Causolve Integrations

Causolve investigates incidents using these evidence sources:

- Metrics, logs, traces, and service topology
- Alerts and incident timelines
- Deployments and configuration changes
- Runtime, database, cache, and external dependency health
- Historical incidents and runbooks

## Initial integrations

- OpenTelemetry: vendor-neutral metrics, logs, traces, and service metadata
- Grafana Cloud: Prometheus metrics, Loki logs, Tempo traces, and alerts
- Datadog: metrics, logs, traces, service maps, deployments, and monitors
- PagerDuty: alerts, incidents, responders, services, and incident timelines
- GitHub/GitLab: commits, pull requests, releases, pipelines, and deployments
- Kubernetes/Prometheus: workload state, service topology, runtime metrics, and events
- AWS, Google Cloud, and Azure: infrastructure metrics, logs, audit events, and changes

Integrations provides evidence to Causolve; they don't replace Causolve's incident, investigation, or evidence models.
