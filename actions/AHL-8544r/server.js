function(properties, context) {
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

    let apikey = properties.apikey;
    if (!apikey || apikey.trim() === "") {
        apikey = context.keys["Global APIKEY"];
    }
    
        if (apikey) {
    apikey = apikey.trim();
    }
    
    let instancia = properties.instancia;
    if (!instancia || instancia.trim() === "") {
        instancia = context.keys["Instancia"];
    }

    var url = baseUrl + "/group/findGroupInfos/" + instancia + "?groupJid=" + properties.groupid;
    
    let headers = {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "apikey": apikey
    };

    let requestOptions = {
        method: 'GET',
        headers: headers,
        uri: url,
        json: true
    };

    let sentRequest;
    let error;
    let error_log;
    try {
        sentRequest = context.request(requestOptions);
    } catch(e) {
        error = true;
        error_log = e.toString();
    }

    if (sentRequest.statusCode.toString().charAt(0) !== "2") {
        error = true;
       
        return {
            error: error,
            error_log: JSON.stringify(sentRequest.body),
        }
    }  

    let resultObj;
    try {
        resultObj = sentRequest.body;
    } catch(e) {
        error = true;
        error_log = `Error getting response body: ${e.toString()}`;
    }

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

    let transformedResult;
    if (Array.isArray(resultObj)) {
        transformedResult = resultObj.map(item => convert(item));
    } else if (typeof resultObj === "object" && resultObj !== null) {
        transformedResult = convert(resultObj);
    } 

    return {
        grupo: transformedResult,
        error: error,
        log: JSON.stringify(resultObj, null, 2),
        error_log: error_log,
    };






}