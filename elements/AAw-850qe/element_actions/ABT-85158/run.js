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

  var url = baseUrl + "/message/sendMedia/" + instancia;
  
// campos opcionais
let caption = properties.caption ? { "caption": properties.caption } : {};
let fileName = properties.filename ? { "fileName": properties.filename } : {};
  
var myHeaders = new Headers();
myHeaders.append("Accept", "*/*");
myHeaders.append("Connection", "keep-alive");
myHeaders.append("Content-Type", "application/json");
myHeaders.append("uazapi", "true");
myHeaders.append("apikey", properties.apikey);
  
let send = properties.media
// Verifica e corrige o campo "send" se necessário
if (properties.media && properties.media.startsWith("//")) {
send = "https:" + properties.media;
}

let mediaMessage = {
  "mediatype": properties.mediatype,
  "media": send,
  ...caption,
  ...fileName
}

var raw = 
  {
    "number": properties.number,
    "mediaMessage": mediaMessage,
    "options": {
      "delay": properties.delay
    }
  };


    // Adicionar "mentions" se properties.mentions for true
    if (properties.mentions === true) {
        raw.options.mentions = { "everyOne": true };
    }

    // Adicionar "quoted" se properties.quoted não estiver vazio
    if (properties.quoted && properties.quoted.trim() !== "") {
        raw.options.quoted = { key: { id: properties.quoted } };
    }

        // Converta o objeto raw em uma string JSON
    var rawString = JSON.stringify(raw);

  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: rawString,
     
  };
  


   


instance.publishState('resultado', '');
instance.publishState('error', false);
instance.publishState('error_log', '');
instance.publishState('lastmsg', '');

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
            
             
            
            instance.publishState('lastmsg', resultObj);
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