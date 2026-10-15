# OmniLingo Live — relay

Inoltra in tempo reale le frasi del relatore agli ascoltatori di una stanza (codice di 6 caratteri).
Nessun salvataggio su disco: stanze in memoria, eliminate 30 minuti dopo l'uscita del relatore.

Produzione: ivoiro-server (`root@178.105.153.192`, chiave `~/.ssh/ivoiro_hetzner`)
- codice in `/opt/omnilingo-live`, servizio systemd `omnilingo-live` (porta 127.0.0.1:8099, utente `omnilingo`)
- nginx: `location /lingo/` nel vhost `transit.ikonetsolutions.com` (vedi `nginx-location.conf`)
- pagina per chi non ha l'app: `https://transit.ikonetsolutions.com/lingo/r/<CODICE>`

Aggiornare: `scp relay.mjs viewer.html root@178.105.153.192:/opt/omnilingo-live/ && ssh ... systemctl restart omnilingo-live`
