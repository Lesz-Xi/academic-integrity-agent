
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables immediately
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const CASUAL_INPUT = `So basically, this research is all about the crazy traffic situation in Davao City. I mean, anyone who's been there knows it's getting worse every year. The city's growing super fast, and honestly, the roads just can't keep up with all the people moving there.

The whole thing started because we wanted to figure out what's actually causing all this mess. Like, is it just too many cars? Bad road planning? Or maybe the public transport system is just not working? We looked at studies from other countries and local research too, trying to piece together why commuters are having such a hard time getting around.

What really caught our attention was how this affects college students, especially those at MMCM. Think about it - students need reliable transport to get to classes, but they're usually on tight budgets. So when the transportation system fails them, it's not just inconvenient, it actually impacts their education.

We decided to use a Descriptive Quantitative Research approach because, honestly, we needed solid numbers to back up what everyone already feels - that transportation in Davao City needs serious work. Plus, we used four different theories to make sense of everything:

First, there's the Transportation System Performance Evaluation framework. This basically helped us measure how well the current system actually works. Are buses running on time? Are there enough routes? That kind of stuff.

Then we used the Theory of Planned Behavior, which sounds fancy but really just looks at why people choose certain transportation options. Like, do students take jeepneys because they're cheap, or because they don't have other choices?

The Sustainable Transportation Theory was important too because we can't just focus on what works now - we need solutions that'll still make sense in 10 or 20 years. Climate change is real, and cities need to think about environmental impact.

And finally, the Technology Acceptance Model helped us understand how open people are to new tech solutions. Would students use a ride-sharing app if it was reliable? Are they interested in electronic payment systems?

For our research method, we used purposive sampling to pick 30 respondents. I know that doesn't sound like a huge number, but we made sure to get a good mix of people who actually represent the student population at MMCM. We did surveys because that's the most practical way to get honest feedback from a bunch of busy college students.`;

async function runTest() {
  // Dynamic import to ensure env vars are loaded first
  const { generateContent } = await import('../src/services/academicIntegrityService');
  console.log('--- STARTING DENSITY RESTORATION TEST ---');
  console.log('Input Structure: Casual Listicle (Short Paragraphs)');
  
  try {
    const result = await generateContent('polish', CASUAL_INPUT);
    
    console.log('\n--- GENERATED OUPUT (PROFESSIONAL MODE) ---');
    console.log(result.text);
    console.log('\n-------------------------------------------');
    
    // Auto-verify density
    const paragraphCount = result.text.split('\n\n').length;
    console.log(`Input Paragraphs: ${CASUAL_INPUT.split('\n\n').length}`);
    console.log(`Output Paragraphs: ${paragraphCount}`);
    
    if (paragraphCount < 4) {
        console.log('✅ SUCCESS: High Density (Consolidated into few blocks)');
    } else {
        console.log('❌ FAILURE: Low Density (Still looks like a listicle)');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
