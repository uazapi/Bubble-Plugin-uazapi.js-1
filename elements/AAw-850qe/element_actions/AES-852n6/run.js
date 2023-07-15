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

  var url = baseUrl + "/instance/fetchInstances";
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("uazapi", "true");
  myHeaders.append("apikey", properties.apikey);

  var requestOptions = {
      method: 'GET',
      headers: myHeaders,
  };

   



    instance.publishState('resultado', '');
    instance.publishState('error', false);
    instance.publishState('error_log', '');

fetch(url, requestOptions)
.then(response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
})
.then(resultObj => {
   // var resultObj = JSON.parse(result);
   
    instance.publishState('resultado', JSON.stringify(resultObj, null, 2).replace(/_p_/g, ""));
    instance.publishState('instancias', resultObj);
})
.catch(error => {
    instance.publishState('error', true);
    instance.publishState('error_log', error.toString());
});
}
