const mongoose = require('mongoose')
const axios = require('axios')
const dictionaryModel = require('../models/vocabModel')

const Dictionary = async function (req, res) {
    try {
        let wordId = req.body.word
        console.log(wordId,">>>>>>>>>>>>.");
        let findWordinCache = await dictionaryModel.findOne({word: wordId}).select({_id:0,word:1,meaning:1,sentence:1})
        if(findWordinCache) return res.status(200).send(findWordinCache)
        const options = {
            url: 'https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/' + wordId,
            method: "GET",
            headers: {
                'app_id': "4a51c068",
                'app_key': "a2b40847201ae0e81088d0df244a0a08" 
            }
        };
        let result = await axios(options)
        var result1=result.data.results[0].lexicalEntries[0].entries[0].senses[0]
        let result2=result.data.results[0].lexicalEntries[0].lexicalCategory.text
        if(result1.hasOwnProperty('crossReferenceMarkers')){
            result1=result.data.results[1].lexicalEntries[0].entries[0].senses[0].definitions[0]
        }
        else{
            result1=result.data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]
        }
        let obj={}
        obj.word = wordId
        if(result1!==undefined) obj.meaning=result1
        if(result2!==undefined) obj.grammar=result2
        const dictionary = await dictionaryModel.create(obj)
        console.log(obj,"obj***********");
        return res.status(200).send(obj)  
    }
    catch (err) {
        if(err.message=="Request failed with status code 404") return res.status(404).send({ status: false, msg: "Not found" })
        res.status(500).send({ status: false, msg: "Error", error: err.message });
    }
}

module.exports = {Dictionary}