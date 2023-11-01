function(instance, properties, context) {
    

    const convert = (data, param_prefix = '_p_') => {
        let addPrefix = (obj, key_parent = null, is_array = false) => {
          let result = {};
      
          Object.keys(obj).forEach(key => {
            let cell = obj[key];
            let key_new = `${param_prefix}${key}`;
      
            if (key_parent && !is_array) key_new = `${key_parent}.${key}`;
      
            if ((!cell && cell !== 0 && cell !== false) || typeof cell === 'undefined') {
              result[key_new] = null;
            } else if (typeof cell !== 'object' && !Array.isArray(cell)) {
              result[key_new] = cell;
            } else if (typeof cell === 'object' && !Array.isArray(cell)) {
              result = Object.assign(result, addPrefix(cell, key_new));
            } else if (Array.isArray(cell)) {
              if (typeof cell[0] === 'object') {
                result[key_new] = [];
                cell.forEach(value => {
                  result[key_new].push(addPrefix(value, key_new, true));
                });
              } else {
                result[key_new] = cell;
              }
            }
          });
      
          return result;
        };
      
        if (Array.isArray(data)) {
          return data.map(obj => addPrefix(obj));
        } else if (typeof data === 'object' && data !== null) {
          return addPrefix(data);
        }
      
        return {};
      };
      

      let source; // Mantenha esta variável no escopo mais amplo, fora da função startSSE
      // Inicialmente sete para false no início do código
        instance.data.sseConnected = "desconectado";
        console.log(instance.data.sseConnected);
        

      function startSSE() {
        if (instance.data.sseConnected === "iniciando" || instance.data.sseConnected === "conectado") {
            console.log("Conexão SSE já está em processo ou já foi estabelecida.");
            return; // Não executa o resto da função se o SSE já foi iniciado ou está conectado
        }
        
        console.log("startSSE iniciado", Date.now());
       
        instance.data.sseConnected = "iniciando";
        console.log(instance.data.sseConnected);


          // Se uma conexão SSE já existir, feche-a
          if (source) {
              source.close();
              console.log("Conexão SSE anterior fechada");
          }
      
          const { baseUrl, instancia } = getBaseUrlAndInstance();
          const url = `${baseUrl}/events/${instancia}?events=messages,chats&apikey=${properties.apikey}`;
              
          source = new EventSource(url, {
              headers: {
                  'Content-Type': 'text/event-stream'
              }
          });
          
           
          source.onmessage = function(event) {
              let data = JSON.parse(event.data);

            // Checa se a mensagem é uma informação de conexão estabelecida
            if (data.info && data.info === "Conexão estabelecida") {
                console.log("Conexão SSE estabelecida com sucesso!");
                instance.data.sseConnected = "conectado";
                console.log(instance.data.sseConnected);
                return;  // Retorna aqui para não processar o resto da função
            }
              
            // Processamento de mensagens
            if (data.message && data.message.key && data.message.key.id) {
                console.log("msg recebida");

                let msgConverted = convert(data.message);

                // Verifique se instance.data e instance.data.mensagens existem e estão definidos corretamente
                if (!instance.data) {
                    instance.data = {};
                }

                if (!instance.data.mensagens || !Array.isArray(instance.data.mensagens)) {
                    instance.data.mensagens = [];
                }

                if (!instance.data.chats || !Array.isArray(instance.data.chats)) {
                    instance.data.chats = []; 
                }

                // Adicione a mensagem à lista de mensagens (sem verificar duplicatas aqui)
                instance.data.mensagens.push(msgConverted);

                const chatIndex = instance.data.chats.findIndex(chat => chat["_p_id"] === msgConverted["_p_key.remoteJid"]);

                if (chatIndex !== -1) {
                    console.log("Chat encontrado para a mensagem");

                    if (!instance.data.chats[chatIndex]._p_msgs) {
                        instance.data.chats[chatIndex]._p_msgs = [];
                    }

                    // Verifique se a mensagem já existe no chat
                    let existingMessageIndexInChat = instance.data.chats[chatIndex]._p_msgs.findIndex(msg => msg && msg["_p_key.id"] === msgConverted["_p_key.id"]);

                    // Se a mensagem existir no chat, atualize-a
                    if (existingMessageIndexInChat !== -1) {
                        console.log("msg existe no chat");
                        instance.data.chats[chatIndex]._p_msgs[existingMessageIndexInChat] = msgConverted;
                    } else {
                        // Caso contrário, adicione a nova mensagem ao chat
                        console.log("msg não existe no chat");
                        instance.data.chats[chatIndex]._p_msgs.push(msgConverted);
                        console.log("Mensagem adicionada ao chat");
                    }

                } else {
                    console.log("Chat NÃO encontrado para a mensagem");
                }

                console.log(JSON.stringify(msgConverted, null, 2));

                // Atualize o estado com a nova lista de mensagens
                //instance.publishState('mensagens', instance.data.mensagens);

                // Atualize o estado com a nova lista de chats
                instance.publishState('chats', instance.data.chats);

                // Emitir um evento de atualização
                instance.triggerEvent('updateEvent');
            }




      
             // Faça algo semelhante para os chats.
             if (data.chat && data.chat.id) {
                console.log("chat recebido");
            
                let chatConverted = convert(data.chat);
            
                let existingChatIndex = instance.data.chats.findIndex(chat => chat && chat["_p_id"] === chatConverted["_p_id"]);
            
                // Se o chat existir, atualize-o
                if (existingChatIndex !== -1) {
                    console.log("chat existe");
            
                    // Guardar temporariamente o valor de _p_msgs do chat existente
                    let existingMsgs = instance.data.chats[existingChatIndex]["_p_msgs"];
            
                    // Sobrescrever o chat
                    instance.data.chats[existingChatIndex] = chatConverted;
            
                    // Restaurar o valor de _p_msgs do chat existente
                    instance.data.chats[existingChatIndex]["_p_msgs"] = existingMsgs;
                } else {
                    console.log("chat não existe");
                    
                    // Caso contrário, adicione o novo chat à lista
                    chatConverted["_p_msgs"] = {};  // Inicializar _p_msgs como um objeto vazio
                    instance.data.chats.push(chatConverted);
                }
            
                console.log(JSON.stringify(chatConverted, null, 2));
                // Atualize o estado com a nova lista de chats
                instance.publishState('chats', instance.data.chats);
                instance.triggerEvent('updateEvent');
            }
            
          }
      
          source.onerror = function(error) {
            console.error("Error occurred with SSE:", error);
            instance.data.sseConnected = "desconectado";
        };
        
      }
      
      
      
      
      
      
      


//(...)

    initialize();

    function initialize() {
        fetchChats()
            .then(() => fetchMessages())
            .catch(error => handleGlobalError(error));
    
        // Chama startSSE após 5 segundos, independentemente das chamadas anteriores
        setTimeout(startSSE, 5000);
    }
    
    function getBaseUrlAndInstance() {
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
        
        return { baseUrl, instancia };
    }

    function sendRequest(url, method = 'GET', body = null) {
        const headers = {
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "uazapi": "true",
            "apikey": properties.apikey
        };
        
        const requestOptions = {
            method: method,
            headers: headers,
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        
        instance.publishState('error', false);
        instance.publishState('error_log', '');

        return fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            });
    }


    function fetchChats() {
        const { baseUrl, instancia } = getBaseUrlAndInstance();
        const url = `${baseUrl}/chat/findChats/${instancia}`;
        return sendRequest(url)
            .then(resultObj => {
                // Adicione um array vazio de 'msgs' a cada chat
                instance.data.chats = resultObj.map(chat => {
                    chat._p_msgs = [];
                    return chat;
                });
                
                instance.publishState('chats', instance.data.chats);
                console.log(instance.data.chats);
                return instance.data.chats;
            })
            .catch(error => {
                if (error.message === 'not ready') {
                    throw error;
                } else {
                    handleGlobalError(error);
                }
            });
    }
    

    function fetchMessages() {
        const { baseUrl, instancia } = getBaseUrlAndInstance();
        const url = `${baseUrl}/chat/findMessages/${instancia}`;
    
        return sendRequest(url, 'POST')
            .then(resultObj => {
                // Primeiro, limpe todos os campos _p_msgs
                instance.data.chats.forEach(chat => {
                    chat._p_msgs = [];
                });
    
                // Crie um mapa para rastrear "_p_key.remoteJid" até os chats
                const chatMap = {};
                instance.data.chats.forEach(chat => {
                    chatMap[chat["_p_id"]] = chat;
                });
    
                resultObj.forEach(message => {
                    // Verificando a propriedade '_p_key.remoteJid' da mensagem
                    const remoteJid = message["_p_key.remoteJid"];
                    if (remoteJid) {
                        const chat = chatMap[remoteJid]; // Busca O(1) em vez de O(n)
    
                        if (chat) {
                            chat._p_msgs.push(message);
                        }
                    } else {
                        // Se não encontrarmos a propriedade desejada, vamos imprimir a mensagem completa
                        console.log("Mensagem sem '_p_key.remoteJid': ", message);
                    }
                });
    
                instance.data.mensagens = resultObj;
               // instance.publishState('mensagens', resultObj);
                instance.publishState('chats', instance.data.chats); 
                console.log(instance.data.chats);
            })
            .catch(error => {
                if (error.message === 'not ready') {
                    throw error;
                } else {
                    handleGlobalError(error);
                }
            });
    }
    
    
    
    
    
    

    function handleGlobalError(error) {
        console.error(error);
        instance.publishState('error', true);
        instance.publishState('error_log', error.toString());
        instance.triggerEvent('errorEvent');
    }


}