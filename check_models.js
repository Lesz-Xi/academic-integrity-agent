
// Removed dotenv dependency
const apiKey = 'AIzaSyBW3WXhHdCmpLEzUuqD5m4ETHjVHbft_sE'; 

console.log('Using API Key:', apiKey.substring(0, 10) + '...');

async function listModels() {
  try {
    // Direct fetch to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available Models:');
      data.models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${m.name}`);
        }
      });
    } else {
      console.error('❌ Failed to list models:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listModels();
