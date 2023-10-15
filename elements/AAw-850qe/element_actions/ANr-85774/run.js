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
  if(properties.flowName) raw.flow = properties.flowName.trim();

  //mensagem opcional
  raw.message = {};
  //if(properties.command) raw.message.command = properties.command.trim();
  if(properties.text) raw.message.text = properties.text.trim();
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
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(resultObj => {
  

  if (Object.keys(resultObj).length > 0) {
 
    instance.publishState('resultado', JSON.stringify(resultObj, null, 2).replace(/"_p_/g, "\""));
    instance.triggerEvent('sucessEvent');
    
  }
})
.catch(error => {
  instance.publishState('error', true);
try {
        // Tentativa de converter a mensagem de erro para um objeto e formatá-lo como JSON
        let errorString = error.toString().replace(/"_p_/g, "\"");
        let errorObject = JSON.parse(errorString);
        let formattedError = JSON.stringify(errorObject, null, 2);
        instance.publishState('error_log', formattedError);
       } catch(e) {
        // Se a conversão falhar, apenas use a mensagem de erro como uma string
        let errorString = error.toString().replace(/"_p_/g, "\"");
        instance.publishState('error_log', errorString);
    }

        instance.triggerEvent('errorEvent');

});



}