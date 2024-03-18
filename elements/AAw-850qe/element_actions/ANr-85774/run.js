function(instance, properties, context) {
    
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

    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }

    var url = baseUrl + "/automate/scheduleMessage/" + instancia;
  
  
  
  var myHeaders = new Headers({
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    "uazapi": "true",
    "apikey": properties.apikey,
  });
    
 // Separando as tags fornecidas pelo usuário em um array  
 let remoteJids = [];  
if (properties.remoteJids) {
    remoteJids = properties.remoteJids.split('|').map(remoteJid => remoteJid.trim());
}

  var raw = {
    "delete": properties.delete,
    "status": properties.status,
    "type": properties.type,
    "remoteJids": remoteJids,
    "when": properties.when,
    "delaySecMin": properties.delaySecMin,
    "delaySecMax": properties.delaySecMax,
};

  //opcionais macro
  if(properties._id != null ) raw._id = properties._id.trim();
  if(properties.info) raw.info = properties.info.trim();

  //fluxo opcional
  if(properties.flowName) raw.flowName = properties.flowName.trim();

  //mensagem opcional
  raw.message = {};
  //if(properties.command) raw.message.command = properties.command.trim();
  if(properties.text) {
  raw.message.text = properties.text.trim();

  // Adiciona linkPreview ao objeto message apenas se text estiver presente
    raw.message.linkPreview = properties.linkPreview;
	}
  if(properties.urlOrBase64) raw.message.urlOrBase64 = properties.urlOrBase64.trim();
  if(properties.mediatype) raw.message.mediatype = properties.mediatype.trim();
  //if(properties.fileName) raw.message.fileName = properties.fileName.trim();
  if(properties.delay != null) raw.message.delay = properties.delay || 0;
  

   
   
  raw = JSON.stringify(raw);

  
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