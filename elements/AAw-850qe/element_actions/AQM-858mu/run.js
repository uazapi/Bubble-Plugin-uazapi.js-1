function(instance, properties, context) {
    //editar config geral XX
  let baseUrl = properties.url;
  if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
      baseUrl = context.keys["Server URL"];
  }

      if (baseUrl) {
    baseUrl = baseUrl.trim();
    }
  if (baseUrl && baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
  }

	const url = `${baseUrl}/config`;
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("uazapi", "true");
  myHeaders.append("apikey", properties.apikey);
  

var payload = {
		"connectedName": properties.connectedName,
        "WebhookGlobal": {
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
            "groups_ignore": properties.groups_ignore,
            "GROUPS_UPSERT":properties.GROUPS_UPSERT,
            "GROUPS_UPDATE":properties.GROUPS_UPDATE,
            "GROUP_PARTICIPANTS_UPDATE":properties.GROUP_PARTICIPANTS_UPDATE
        }
};



var raw = JSON.stringify(payload);

  

  var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
     
  };
  

instance.publishState('config', '');
instance.publishState('resultado', '');
instance.publishState('error', false);
instance.publishState('error_log', '');

fetch(url, requestOptions)
.then(response => {
  // Sempre obter o corpo da resposta, independentemente do status da resposta
  return response.json().then(resultObj => {
      // Se a resposta não for ok, adicione o status ao objeto de erro e lance-o
      if (!response.ok) {
          resultObj.errorStatus = response.status;
          throw resultObj;
      }
      return resultObj; // Retorna o objeto de resultado para a próxima etapa
  });
 })
.then(resultObj => {
  
  
  if (Object.keys(resultObj).length > 0) {
    
    instance.publishState('resultado', JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""));
    instance.triggerEvent('sucessEvent');
    
    instance.publishState('config', resultObj);  
  }
})
.catch(errorObj => {
  instance.publishState('error', true);
  try {
      // Verifica se as chaves têm o prefixo _p_ e acessa os valores adequadamente
      let errorStatus = errorObj._p_errorStatus || errorObj.errorStatus || '';
      let error = errorObj._p_error || errorObj.error || '';
      let message = '';

      if (errorObj._p_message || errorObj.message) {
          let messageArray = errorObj._p_message || errorObj.message;
          message = Array.isArray(messageArray) ? messageArray.join('\n') : messageArray;
      }

      let errorMessage = [errorStatus, error, message].filter(Boolean).join('\n');
      instance.publishState('error_log', errorMessage);
  } catch(e) {
      instance.publishState('error_log', e.toString().replace(/"_p_/g, "\""));
  }
  instance.triggerEvent('errorEvent');
});



}