function(instance, properties, context) {
    
  let baseUrl = properties.url;
  if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
      baseUrl = context.keys["Server URL"];
  }

  var url = baseUrl + "/instance/delete/" + properties.instancia + "?convert=true";
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("apikey", properties.apikey);
  
  

  var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,

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
  
 // var resultObj = JSON.parse(result);
  
  
  if (Object.keys(resultObj).length > 0) {

    instance.publishState('resultado', JSON.stringify(resultObj, null, 2));
    
  }
})
.catch(error => {
  instance.publishState('error', true);
instance.publishState('error_log', error.toString());


});



}