# PROD - instalare Node Exporter pentru monitorizare

Acest document descrie pasii pentru instalarea Node Exporter pe serverul de productie MetaHuman, astfel incat Prometheus sa poata colecta metrici de sistem.

## Scop

Node Exporter expune metrici despre server:

- CPU
- memorie RAM
- disc
- retea
- load average
- filesystem

Metricile sunt expuse implicit pe portul `9100`.

## Instalare pe server Linux

```bash
sudo useradd --no-create-home --shell /usr/sbin/nologin node_exporter
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-1.9.1.linux-amd64.tar.gz
tar xvf node_exporter-1.9.1.linux-amd64.tar.gz
sudo cp node_exporter-1.9.1.linux-amd64/node_exporter /usr/local/bin/
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter
```

## Serviciu systemd

Creati fisierul:

```bash
sudo nano /etc/systemd/system/node_exporter.service
```

Continut:

```ini
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
```

Pornire serviciu:

```bash
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
sudo systemctl status node_exporter
```

## Verificare locala

```bash
curl http://localhost:9100/metrics
```

Daca instalarea este corecta, raspunsul contine metrici text, de forma:

```text
node_cpu_seconds_total
node_memory_MemAvailable_bytes
node_filesystem_avail_bytes
```

## Configurare Prometheus

In `prometheus.yml`, adaugati target-ul:

```yaml
scrape_configs:
  - job_name: "metahuman-node"
    static_configs:
      - targets: ["IP_SERVER:9100"]
```

Dupa modificare:

```bash
sudo systemctl restart prometheus
```

## Securitate

Recomandat pentru productie:

- portul `9100` sa fie accesibil doar din reteaua interna sau prin WireGuard;
- sa nu fie expus public prin Cloudflare/Nginx;
- firewall-ul sa permita acces doar de la serverul Prometheus.

Exemplu `ufw`:

```bash
sudo ufw allow from IP_PROMETHEUS to any port 9100 proto tcp
```

## Verificare in Grafana

In Grafana, folositi dashboard-uri Node Exporter, de exemplu:

- CPU usage
- Memory usage
- Disk usage
- Network traffic
- Server load

Task-ul este considerat finalizat cand:

- `systemctl status node_exporter` este `active`;
- `curl http://localhost:9100/metrics` returneaza metrici;
- Prometheus vede target-ul `metahuman-node` ca `UP`;
- Grafana afiseaza metricile serverului.
