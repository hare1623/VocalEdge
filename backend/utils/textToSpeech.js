const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");

const generateAudio = async (text, fileName) => {
  const client = new textToSpeech.TextToSpeechClient();

  const request = {
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  const [response] = await client.synthesizeSpeech(request);
  const filePath = `./uploads/${fileName}.mp3`;
  await util.promisify(fs.writeFile)(filePath, response.audioContent, "binary");
  return filePath;
};

module.exports = generateAudio;
