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

  var url = baseUrl + "/message/sendPoll/" + instancia;
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Content-Type", "application/json");
  myHeaders.append("uazapi", "true");
  myHeaders.append("apikey", properties.apikey);
  

// Separando as opções fornecidas pelo usuário em um array
let values = properties.values.split('|').map(opcao => opcao.trim());

var raw = JSON.stringify(
    {
      "number": properties.number,
      "pollMessage": {
        "name": properties.name,
        "selectableCount": properties.selectableCount,
        "values": values
      }
    }
);

  

  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
     
  };
  console.log(raw);

   

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