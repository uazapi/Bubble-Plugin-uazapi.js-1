function(instance, properties, context) {
    
  let baseUrl = properties.url;
  if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
      baseUrl = context.keys["Server URL"];
  }

  let instancia = properties.instancia;
  if (!apikey || apikey.trim() === "") {
      apikey = context.keys["Instancia"];
  }

  var url = baseUrl + "/message/sendLocation/" + instancia + "?convert=true";
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("apikey", properties.apikey);
  

  var raw = JSON.stringify(
    {
      "number": properties.number,
      "locationMessage": {
        "name": properties.name,
        "address": properties.address,
        "latitude": properties.latitude,
        "longitude": properties.longitude
      },
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
      //  var resultObj = JSON.parse(result);
        
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