function(instance, properties, context) {
    // 🔓 Mensagem - Marcar como lida
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

  var url = baseUrl + "/chat/markMessageAsRead/" + instancia;
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  //  myHeaders.append("uazapi", "true");
  myHeaders.append("apikey", properties.apikey);
  

    let messageData;
    if (properties.multipleMessages) {
        // Processando múltiplas mensagens
        messageData = JSON.parse(properties.multipleMessages);
    } else {
        // Processando uma única mensagem
        messageData = [{
            remoteJid: properties.remoteJid,
            fromMe: properties.fromMe,
            id: properties.id
        }];
    }

    var raw = JSON.stringify({ "readMessages": messageData });

  

  var requestOptions = {
      method: 'PUT',
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
  
 //var resultObj = JSON.parse(result);
  
  
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