import json
import time
import requests
from datetime import datetime, timezone
import os
from collections import defaultdict

# Va a coger 1 dato de cada bici por segundo, ejecuto este fichero a mano
def post_data_by_bike(file_path, endpoint_url):
    with open(file_path, 'r') as f:
        records = json.load(f)
    
    # Agrupa por bike_id.
    grouped_records = defaultdict(list)
    for record in records:
        bike_id = record.get('bike_id')
        grouped_records[bike_id].append(record)
    
    while any(records_list for records_list in grouped_records.values()):
        # Para cada bici hace un envío por segundo, con la fecha actual
        for bike_id, records_list in grouped_records.items():
            if records_list:
                record = records_list.pop(0)
                record['fecha'] = datetime.now(timezone.utc).isoformat(timespec='seconds')
                try:
                    response = requests.post(endpoint_url, json=record)
                    print(
                        f"Bicicleta {bike_id}: HTTP {response.status_code}, "
                        f"Respuesta: {response.json()}"
                    )
                except Exception as e:
                    print(f"Bicicleta {bike_id}: Error en el post: {e}")
        time.sleep(1)

if __name__ == '__main__':
    endpoint = "https://bicicletas-sensorizadas-default-rtdb.europe-west1.firebasedatabase.app/bike_data.json"
    script_dir = os.path.dirname(os.path.abspath(__file__))  
    file_path = os.path.join(script_dir, "realtime_test.json")
    post_data_by_bike(file_path, endpoint)

