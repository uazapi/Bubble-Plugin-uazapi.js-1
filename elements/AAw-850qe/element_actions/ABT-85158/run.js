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

  var url = baseUrl + "/message/sendMedia/" + instancia + "?convert=true";
  
// campos opcionais
let caption = properties.caption ? { "caption": properties.caption } : {};
let fileName = properties.filename ? { "fileName": properties.filename } : {};
  
var myHeaders = new Headers();
myHeaders.append("Accept", "*/*");
myHeaders.append("Connection", "keep-alive");
myHeaders.append("Content-Type", "application/json");
myHeaders.append("apikey", properties.apikey);
  

let mediaMessage = {
  "mediatype": properties.mediatype,
  "media": properties.media,
  ...caption,
  ...fileName
}

var raw = JSON.stringify(
  {
    "number": properties.number,
    "mediaMessage": mediaMessage,
    "options": {
      "delay": properties.delay
    }
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
instance.publishState('lastmsg', '');

fetch(url, requestOptions)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(resultObj => {
        
       
        
        if (Object.keys(resultObj).length > 0) {
          instance.publishState('resultado', JSON.stringify(resultObj, null, 2));
            
             if (resultObj._p_status !== "PENDING") {
                instance.publishState('error', true);
                instance.publishState('error_log', JSON.stringify(resultObj, null, 2));
            }
            // Publicando a mensagem convertida
            instance.publishState('lastmsg', resultObj);
        }
    })
    .catch(error => {
        instance.publishState('error', true);
        instance.publishState('error_log', error.toString());
    });



}