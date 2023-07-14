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

  var url = baseUrl + "/group/sendMention/" + instancia + "?groupJid=" + properties.group;
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("apikey", properties.apikey);
  

  var raw = JSON.stringify(
    {
      "mention": properties.mention
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
            

            // Publicando a mensagem convertida
            //instance.publishState('lastmsg', resultObj);
            
        }
    })
    .catch(error => {
        instance.publishState('error', true);
        instance.publishState('error_log', error.toString());
    });


}