let db = require('realm');
let CLIENT = "Client";

const Client = {
    name: CLIENT,
    primaryKey: 'id',
    properties: {
        id: 'int',
        name: { type: 'string', indexed: true },
        email: 'string',
        phone: 'string'
    }
}

const databaseOptions = {
    path: 'Realm.realm',
    schema: [Client]
}

const getAllClients = (request, response) => {
    let apiKey = request.headers.apikey;
    if (!watchDog(apiKey)) {
        response.status(403).json("Prohibido, ApiKey no válida, so hacker");
        return;
    }
    Realm.open(databaseOptions).then(realm => {
        let allClient = realm.objects(CLIENT);
        if (allClient == '') {
            response.status(200).json("No hay ningún cliente");
        } else {
            response.status(200).json(allClient);
        }
    }).catch((error) => {
        console.log(error);
    })
}

const getClientByName = (request, response) => {
    let apiKey = request.headers.apikey;
    if (!watchDog(apiKey)) {
        response.status(403).json("Prohibido, ApiKey no válida, so hacker");
        return;
    }
    let name = request.params.name;

    if (name) {
        Realm.open(databaseOptions).then(realm => {
            let filteredClient = realm.objects(CLIENT).filtered(`name CONTAINS[c] '${name}'`)
            if (filteredClient == '') {
                response.status(200).json("No hay ningún cliente con ese nombre");
            } else {
                response.status(200).json(filteredClient);
            }
        }).catch((error) => {
            console.log(error);
        })
    } else {
        response.status(200).json("Faltan parametros");
    }
    
}

const createClient = (request, response) => {
    let apiKey = request.headers.apikey;
    if (!watchDog(apiKey)) {
        response.status(403).json("Prohibido, ApiKey no válida, so hacker");
        return;
    }
    let name = request.body.name;
    let email = request.body.email;
    let phone = request.body.phone;

    if (name && email && phone) {
        db.open(databaseOptions).then(realm => {

            let filteredUsers = realm.objects(CLIENT).filtered(`email='${email.trim()}'`)
            if (filteredUsers.length > 0) {
                response.status(200).json("Cliente ya existe");
            } else {
                realm.write(() => {
                    let newClient = {};
                    newClient.id = Math.floor(Date.now());
                    newClient.name = name;
                    newClient.phone = phone;
                    newClient.email = email;
                    console.log(newClient);
                    realm.create(CLIENT, newClient);
                    response.status(200).json("Cliente creado correctamente");
                });
            }


        }).catch((error) => {
            console.log(error);
        });
    } else {
        response.status(200).json("Faltan parametros");
    }


}

const updateClient = (request, response) => {
    let apiKey = request.headers.apikey;
    if (!watchDog(apiKey)) {
        response.status(403).json("Prohibido, ApiKey no válida, so hacker");
        return;
    }
    let id = request.params.id;
    let name = request.body.name;
    let phone = request.body.phone;

    console.log(name);

    if (id && name && phone) {
        Realm.open(databaseOptions).then(realm => {
            realm.write(() => {
                let client = realm.objectForPrimaryKey(CLIENT, id)
                if (!client) {
                    response.status(200).json("No hay ningun cliente con ese id");
                } else {
                    client.name = name;
                    client.email = phone;
                    response.status(200).json("Actualizado con éxito");
                }

            });
        }).catch((error) => {
            console.log(error);
        })
    } else {
        response.status(200).json("Faltan parametros");
    }


}
const deleteClient = (request, response) => {
    let apiKey = request.headers.apikey;
    if (!watchDog(apiKey)) {
        response.status(403).json("Prohibido, ApiKey no válida, so hacker");
        return;
    }
    let id = request.params.id;

    let q = `DELETE FROM clientes WHERE id=${id}`;
    pool.query(q, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            //console.log(result);
            response.status(200).json(`Usuario ${id} eliminado`);
        }
    })
}

const watchDog = (apiKey) => {
    if (apiKey != "iodfjsaiofsdlkcmxslc32132|#@|") {
        return false
    } else {
        return true;
    }
}

module.exports = {
    getAllClients,
    getClientByName,
    createClient,
    updateClient,
    deleteClient
}