function(instance, properties, context) {
    
  let baseUrl = properties.url;
  if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
      baseUrl = context.keys["Server URL"];
  }

      if (baseUrl) {
    baseUrl = baseUrl.trim();
    }
  if (baseUrl || baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
  }

    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }

  var url = baseUrl + "/webhook/set/" + instancia + "?convert=true";;
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("apikey", properties.apikey);
  

  var raw = JSON.stringify(
    {
      "enabled": properties.enabled,
      "local_map": properties.local_map,
      "url": properties.webhookurl,
      "STATUS_INSTANCE":properties.STATUS_INSTANCE,
      "QRCODE_UPDATED":properties.QRCODE_UPDATED,
      "MESSAGES_SET":properties.MESSAGES_SET,
      "MESSAGES_UPDATE":properties.MESSAGES_UPDATE,
      "MESSAGES_UPSERT":properties.MESSAGES_UPSERT,
      "SEND_MESSAGE":properties.SEND_MESSAGE,
      "CONTACTS_SET":properties.CONTACTS_SET,
      "CONTACTS_UPSERT":properties.CONTACTS_UPSERT,
      "CONTACTS_UPDATE":properties.CONTACTS_UPDATE,
      "PRESENCE_UPDATE":properties.PRESENCE_UPDATE,
      "CHATS_SET":properties.CHATS_SET,
      "CHATS_UPSERT":properties.CHATS_UPSERT,
      "CHATS_UPDATE":properties.CHATS_UPDATE,
      "CHATS_DELETE":properties.CHATS_DELETE,
      "CONNECTION_UPDATE":properties.CONNECTION_UPDATE,
      "GROUPS_UPSERT":properties.GROUPS_UPSERT,
      "GROUPS_UPDATE":properties.GROUPS_UPDATE,
      "GROUP_PARTICIPANTS_UPDATE":properties.GROUP_PARTICIPANTS_UPDATE
  }
  );

  

  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
     
  };
  
   



instance.publishState('resultado', '');
instance.publishState('error', false);
instance.publishState('error_log', '');

fetch(url, requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(resultObj => {
      
 
   
      instance.publishState('resultado', JSON.stringify(resultObj, null, 2));
      instance.publishState('webhook', resultObj); // Atualizar esta linha
    })
    .catch(error => {
      instance.publishState('error', true);
      instance.publishState('error_log', error.toString());
    });
}
