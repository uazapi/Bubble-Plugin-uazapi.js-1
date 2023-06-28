function(instance, properties, context) {
    //🔓 Grupo - Detalhes
  let baseUrl = properties.url;
  if (!baseUrl || baseUrl.trim() === "" || !baseUrl.includes("http")) {
      baseUrl = context.keys["Server URL"];
  }

  let instancia = properties.instancia;
  if (!apikey || apikey.trim() === "") {
      apikey = context.keys["Instancia"];
  }

  var url = baseUrl + "/group/findGroupInfos/" + instancia + "?groupJid=" + properties.groupid;
  
  
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("apikey", properties.apikey);
  

  

  var requestOptions = {
      method: 'GET',
      headers: myHeaders,

  };
    
  let convert = (obj, param_prefix) => {

    if (typeof obj !== 'object' || Array.isArray(obj)) return {};

    if (!['_p_', '_api_c2_'].includes(param_prefix)) param_prefix = '_p_';

    let addPrefix = (obj, key_parent, is_array) => {

        let result = {};

        Object.keys(obj).forEach(key => {

            let cell = obj[key];
            let key_new = `${param_prefix}${key}`;

            if (key_parent && !is_array) key_new = `${key_parent}.${key}`;

            if ((!cell && cell !== 0 && cell !== false) || typeof cell === 'undefined') {
                result[key_new] = null
            } else if (typeof cell !== 'object' && !Array.isArray(cell)) {
                result[key_new] = cell
            } else if (typeof cell === 'object' && !Array.isArray(cell)) {
                result = Object.assign(result, addPrefix(cell, key_new))
            } else if (Array.isArray(cell)) {
                if (typeof cell[0] === 'object') {
                    result[key_new] = [];
                    cell.forEach(value => {
                        result[key_new].push(addPrefix(value, key_new, true))
                    });
                } else {
                    result[key_new] = cell;
                }
            }
        });

        return result;
    };

    return addPrefix(obj);
};








instance.publishState('resultado', '');
instance.publishState('error', false);
instance.publishState('error_log', '');

fetch(url, requestOptions)
.then(response => response.json())
.then(resultObj => {

let transformedResult = convert(resultObj);
instance.publishState('resultado', JSON.stringify(resultObj, null, 2));
instance.publishState('grupo', transformedResult);

})
.catch(error => {
instance.publishState('error', true);
instance.publishState('error_log', error.toString());
});




}