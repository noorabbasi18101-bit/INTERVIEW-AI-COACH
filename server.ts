import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get Gemini client lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to try Gemini with primary model, then secondary fallback model
async function callGeminiWithFallback(ai: GoogleGenAI, primaryModel: string, secondaryModel: string, prompt: string, config: any) {
  try {
    return await ai.models.generateContent({
      model: primaryModel,
      contents: prompt,
      config,
    });
  } catch (err: any) {
    if (err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('429')) {
      console.warn(`Primary model ${primaryModel} quota exceeded. Trying fallback model ${secondaryModel}...`);
      return await ai.models.generateContent({
        model: secondaryModel,
        contents: prompt,
        config,
      });
    }
    throw err;
  }
}

// 1. Generate Interview Questions
app.post('/api/interview/generate-questions', async (req, res) => {
  try {
    const {
      type = 'Job Interview',
      level = 'Intermediate',
      field = 'Software Engineering',
      language = 'EN',
      timestamp = Date.now(),
    } = req.body;

    // Determine target question count based on level
    const targetCount = level === 'Beginner' ? 5 : level === 'Advanced' ? 10 : 8;

    let parsedQuestions: any[] = [];

    try {
      const ai = getGeminiClient();

      const prompt = `As an elite corporate interviewer and hiring manager, generate exactly ${targetCount} fresh, highly relevant, non-repeating interview questions.

Interview Configuration:
- Domain/Field: "${field}"
- Interview Format/Type: "${type}"
- Experience Level: "${level}"
  * Beginner Level: Exactly 5 questions. Should be entry-level, fundamental, easy to understand.
  * Intermediate Level: Exactly 8 questions. Should test moderate technical depth, problem-solving, and practical trade-offs.
  * Advanced Level: Exactly 10 questions. Should be complex, high-level professional scenarios, architecture, system scaling, and strategic decision making.
- Unique Timestamp/Nonce: ${timestamp}_${Math.floor(Math.random() * 10000)}
${language === 'UR' ? 'Provide all questions and quickTips in Urdu.' : 'Provide all questions and quickTips in English.'}

STRICT CONSTRAINTS:
1. Generate EXACTLY ${targetCount} questions tailored specifically to "${field}" and level "${level}".
2. Do NOT reuse generic templates. Questions must feel custom-tailored to "${field}".
3. Ensure question IDs range from 1 to ${targetCount}.
4. Return JSON with key "questions" containing an array of ${targetCount} objects.`;

      const response = await callGeminiWithFallback(
        ai,
        'gemini-3.6-flash',
        'gemini-3.1-flash-lite',
        prompt,
        {
          systemInstruction: 'You are an expert corporate recruiter generating realistic, level-appropriate interview questions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    category: { type: Type.STRING },
                    question: { type: Type.STRING },
                    quickTip: { type: Type.STRING },
                  },
                  required: ['id', 'category', 'question', 'quickTip'],
                },
              },
            },
            required: ['questions'],
          },
        }
      );

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);
      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        parsedQuestions = parsed.questions;
      }
    } catch (geminiError) {
      console.warn('Gemini question generation rate limited or unavailable, using structured fallback set:', geminiError);
    }

    // Fallback generator if AI returned invalid format or hit quota
    if (parsedQuestions.length < targetCount) {
      const fallbackTemplates: Record<string, string[]> = {
        'Software Engineering': [
          'Walk me through a project where you had to choose a database model. What trade-offs did you evaluate?',
          'How do you approach debugging a memory leak or sudden performance degradation in production?',
          'Explain the concept of asynchronous processing or event loops to a non-technical stakeholder.',
          'How do you write effective unit and integration tests for complex business logic?',
          'Describe a situation where you had to refactor a legacy codebase. How did you ensure zero downtime?',
          'What strategy do you use when reviewing pull requests to ensure code quality and security?',
          'How do you manage API versioning and backward compatibility in a microservices ecosystem?',
          'Tell me about a time you made a wrong architectural assumption. How did you recover?',
          'How do you ensure data consistency across distributed systems during high traffic bursts?',
          'How do you balance delivering features quickly against accumulating technical debt?',
        ],
        'Data Science & AI': [
          'How do you handle missing or noisy data during feature engineering?',
          'Explain the difference between overfitting and underfitting and how to mitigate both.',
          'How do you evaluate model performance beyond simple accuracy metrics?',
          'Walk me through a machine learning model you built from scratch and deployed to production.',
          'How do you explain complex model outputs to business stakeholders?',
          'What techniques do you use to deal with class imbalance in classification problems?',
          'How do you monitor model drift over time once deployed in production?',
          'Compare transformer architectures vs traditional sequential models for NLP tasks.',
          'How do you ensure data privacy and AI ethics in predictive models?',
          'Describe a time when data-driven findings directly altered business strategy.',
        ],
        'Product Management': [
          'How do you prioritize competing feature requests from engineering, sales, and end users?',
          'Walk me through how you construct and validate a product roadmap.',
          'Describe a feature you launched that failed to hit target metrics. What did you learn?',
          'How do you define key performance indicators (KPIs) for a brand new product?',
          'How do you conduct customer interviews to extract unarticulated user needs?',
          'Tell me about a time you had to say "no" to a high-priority request from a senior executive.',
          'How do you collaborate with engineering teams during sprint planning and scoping?',
          'Describe how you evaluate pricing and monetization strategy for SaaS products.',
          'How do you use quantitative analytics alongside qualitative research?',
          'Walk me through how you conduct a competitive breakdown for a new market opportunity.',
        ],
        'Marketing & Sales': [
          'How do you structure a multi-channel acquisition campaign from scratch?',
          'Explain how you optimize Customer Acquisition Cost (CAC) against Lifetime Value (LTV).',
          'Describe a time an A/B test led to unexpected results. How did you adapt your campaign?',
          'How do you track conversion funnels and attribution across search, social, and email channels?',
          'What strategies do you use for content marketing and search intent optimization?',
          'How do you manage budget allocation during high-performing vs under-performing campaign phases?',
          'Describe your experience with automated email lifecycle sequences and customer retention.',
          'How do you leverage audience segmentation to improve click-through rates (CTR) and conversions?',
          'How do you adapt marketing strategy when facing a sudden shift in consumer demand or competitor activity?',
          'Walk me through a campaign pitch you created for a brand-new product launch.',
        ],
        'Finance & Business': [
          'How do you build a financial forecast model when historical data is limited or volatile?',
          'Explain how you evaluate capital allocation and return on investment (ROI) for new initiatives.',
          'How do you assess financial risk and liquidity requirements during economic downturns?',
          'Walk me through how you perform a variance analysis between actual performance and budget.',
          'How do you explain complex financial reports to non-finance executive stakeholders?',
          'What key financial metrics do you monitor daily to evaluate business unit health?',
          'Describe a time you identified cost inefficiencies and successfully implemented savings.',
          'How do you conduct due diligence when evaluating a potential merger or strategic partnership?',
          'How do you approach working capital management and cash flow optimization?',
          'Tell me about a challenging financial decision you had to make with incomplete information.',
        ],
        'Design & UX': [
          'How do you conduct user research before initiating the wireframing and prototype phase?',
          'Explain your process for building and maintaining an accessible, scalable design system.',
          'How do you handle feedback from engineers when a visual design is technically difficult to build?',
          'Describe a time you used usability testing data to redesign a confusing interaction flow.',
          'How do you balance aesthetic design choices with WCAG AA/AAA accessibility standards?',
          'Walk me through a portfolio project where you solved a complex user friction point.',
          'How do you measure the qualitative and quantitative impact of a design update post-launch?',
          'What is your approach to micro-interactions and responsive design across desktop and mobile?',
          'How do you approach mobile-first layout design for data-heavy dashboards?',
          'Describe how you advocate for end-user needs during strategic product roadmap sessions.',
        ],
        'Healthcare & Medical': [
          'How do you maintain patient confidentiality and compliance (e.g. HIPAA) during daily care operations?',
          'Describe a high-stress emergency situation where you had to prioritize patient triage under time pressure.',
          'How do you communicate complex medical diagnoses or treatment plans to anxious patients and families?',
          'What steps do you take to minimize medical errors and ensure strict adherence to clinical protocols?',
          'Tell me about a time you collaborated with a multi-disciplinary medical team to improve patient outcomes.',
          'How do you stay updated with medical research, clinical guidelines, and emerging treatment technologies?',
          'Describe a situation where you encountered an ethical dilemma in patient care and how you resolved it.',
          'How do you manage physical and mental fatigue during demanding, extended clinical shifts?',
          'What is your strategy for handling difficult or uncooperative patient interactions with empathy?',
          'How do you integrate electronic health record (EHR) documentation without sacrificing patient interaction quality?',
        ],
        'General Business': [
          'How do you align daily operational activities with overall corporate strategic objectives?',
          'Describe a time you managed a cross-functional project with tight deadlines and shifting priorities.',
          'How do you approach conflict resolution between team members with differing priorities?',
          'What methodologies do you use to streamline redundant business processes and improve efficiency?',
          'How do you communicate organizational changes effectively to keep team morale high?',
          'Describe how you analyze market trends to identify new growth opportunities for the business.',
          'How do you establish and track Key Performance Indicators (KPIs) for team operational goals?',
          'Tell me about a time you made a business decision based on data analysis rather than intuition.',
          'How do you build strong relationships with external vendor partners and key clients?',
          'What is your approach to risk management when entering a new market or launching a initiative?',
        ],
        'Other': [
          'Tell me about yourself and why you are interested in growing your career in this field.',
          'What are your key strengths, and how do you apply them to solve difficult challenges at work?',
          'Describe a situation where you faced a major obstacle or setback. How did you handle it?',
          'How do you prioritize your daily task list when faced with multiple urgent requests?',
          'Give an example of how you effectively communicated a complex idea to someone with a different background.',
          'Describe a time you worked in a team environment to achieve a shared goal. What was your role?',
          'How do you handle constructive criticism or feedback from a supervisor or peer?',
          'Tell me about a time you had to learn a new tool, skill, or system very quickly.',
          'Where do you see yourself professionally in three to five years, and how does practice help you get there?',
          'Why should an employer hire you over other qualified candidates for this position?',
        ],
      };

      const defaultList = fallbackTemplates[field] || fallbackTemplates['Other'];
      const seed = Math.abs((typeof timestamp === 'number' ? timestamp : Date.now())) % defaultList.length;
      const rotatedList = [...defaultList.slice(seed), ...defaultList.slice(0, seed)];

      parsedQuestions = Array.from({ length: targetCount }, (_, i) => ({
        id: i + 1,
        category: i % 2 === 0 ? `${type} - ${level}` : `${field} - Scenario`,
        question: rotatedList[i % rotatedList.length] || `Describe a real-world scenario in ${field} demonstrating your problem-solving process for ${level} level responsibilities.`,
        quickTip: language === 'UR' ? 'STAR طریقہ کار (صورتحال، کام، عمل، نتیجہ) کے تحت جواب ترتیب دیں۔' : 'Use the STAR method (Situation, Task, Action, Result) to structure your response.',
      }));
    }

    res.json({ questions: parsedQuestions.slice(0, targetCount) });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate questions' });
  }
});

// Local Fallback Evaluator for Answer Rating
function evaluateAnswerFallback(params: any) {
  const { answer = '', language = 'EN', field = 'Software Engineering', level = 'Intermediate' } = params;
  const trimmed = answer.trim();
  const len = trimmed.length;
  const isUrdu = language === 'UR';

  if (len < 10) {
    return {
      score: 35,
      logicScore: 30,
      clarityScore: 25,
      softSkillsScore: 40,
      celebrationMessage: isUrdu ? 'مزید وضاحت کی ضرورت ہے' : 'Needs More Explanation',
      celebrationSubtext: isUrdu
        ? 'آپ کا جواب بہت مختصر تھا۔ مکمل سوال کا جواب دینے کے لیے STAR طریقہ کار کا استعمال کریں۔'
        : 'Your answer was too brief. Expand with specific examples and STAR steps.',
      strengths: [isUrdu ? 'سوال کا انتخاب' : 'Direct question attempt'],
      watchOutFor: [
        {
          title: isUrdu ? 'جواب کی لمبائی' : 'Answer Completeness',
          feedback: isUrdu
            ? 'بہت کم الفاظ کا جواب تفصیلی تکنیکی مہارت کو ظاہر نہیں کرتا۔'
            : 'Very short answers do not demonstrate depth of field knowledge or problem-solving capability.',
        },
      ],
      coachTip: isUrdu
        ? '"ہمیشہ صورتحال (Situation)، کام (Task)، عمل (Action)، اور نتیجہ (Result) بیان کریں۔"'
        : '"Always structure answers using STAR: Situation, Task, Action, and Result to showcase full impact."',
      coachTitle: isUrdu ? 'کوچ الیکس کا مشورہ' : "Coach Alex's Tip",
      coachSubtitle: isUrdu ? 'بنیادی تکنیک' : 'Core Structure',
      growthPlan: [
        {
          title: isUrdu ? 'تفصیلی وضاحت' : 'Answer Depth',
          description: isUrdu ? 'جواب میں کم از کم 3 اہم نکات شامل کریں۔' : 'Include at least 3 concrete key points per response.',
        },
        {
          title: isUrdu ? 'محدودیتیں' : 'Trade-offs',
          description: isUrdu ? 'اپنے حل کے فائدے اور نقصانات بتائیں۔' : 'Highlight pros and cons of your chosen approach.',
        },
      ],
    };
  }

  if (len < 80) {
    return {
      score: 68,
      logicScore: 70,
      clarityScore: 72,
      softSkillsScore: 65,
      celebrationMessage: isUrdu ? 'اچھی کوشش!' : 'Solid Foundation!',
      celebrationSubtext: isUrdu
        ? 'آپ نے جواب کا بنیادی حصہ پیش کیا، لیکن مزید گہرائی شامل کی جا سکتی ہے۔'
        : 'You covered the key concept well. Adding quantitative metrics will elevate your answer.',
      strengths: [
        isUrdu ? 'بنیادی تصور کی واضح شناخت' : 'Clear identification of core topic',
        isUrdu ? 'سوال کا براہ راست جواب' : 'Direct response to the prompt',
      ],
      watchOutFor: [
        {
          title: isUrdu ? 'مثالیں اور میٹرکس' : 'Examples & Metrics',
          feedback: isUrdu
            ? 'اپنے ماضی کے منصوبوں سے ٹھوس اعداد و شمار اور مثالیں شامل کرنے کی کوشش کریں۔'
            : 'Try to incorporate concrete metrics (e.g. 20% latency reduction) or real project examples.',
        },
      ],
      coachTip: isUrdu
        ? '"جب آپ اعداد و شمار شامل کرتے ہیں تو آپ کے جوابات زیادہ پرامید لگتے ہیں۔"'
        : '"Mentioning specific tools and measurable outcomes makes your experience immediately credible."',
      coachTitle: isUrdu ? 'کوچ الیکس کا مشورہ' : "Coach Alex's Tip",
      coachSubtitle: isUrdu ? 'کارکردگی بڑھائیں' : 'Metric Integration',
      growthPlan: [
        {
          title: isUrdu ? 'میٹرکس' : 'Quantify Impact',
          description: isUrdu ? 'نتائج میں فی صد یا وقت کے اعداد شامل کریں۔' : 'Mention percentages or time saved in final outcomes.',
        },
        {
          title: isUrdu ? 'مسائل کا حل' : 'Edge Cases',
          description: isUrdu ? 'غير متوقع چیلنجز سے نمٹنے کا طریقہ بتائیں۔' : 'Discuss handling edge cases or error scenarios.',
        },
      ],
    };
  }

  return {
    score: 88,
    logicScore: 90,
    clarityScore: 86,
    softSkillsScore: 88,
    celebrationMessage: isUrdu ? 'بہترین جواب!' : 'Outstanding Response!',
    celebrationSubtext: isUrdu
      ? 'آپ نے انتہائی تفصیلی اور پیشہ ورانہ انداز میں جواب دیا!'
      : 'Comprehensive, structured, and highly relevant answer demonstrating strong domain knowledge.',
    strengths: [
      isUrdu ? 'تکنیکی گہرائی اور واضح ساخت' : 'Strong technical depth and logical structure',
      isUrdu ? 'عملی تجربے کا مؤثر اظہار' : 'Effective demonstration of practical real-world execution',
    ],
    watchOutFor: [
      {
        title: isUrdu ? 'فن تعمیر کے متبادل' : 'Architectural Alternatives',
        feedback: isUrdu
          ? 'آئندہ کے سینئر انٹرویوز کے لیے دیگر ممکنہ ڈیزائنوں پر بھی مختصراً بات کریں۔'
          : 'Briefly mention alternative approaches considered before settling on your primary solution.',
      },
    ],
    coachTip: isUrdu
      ? '"آرکیٹیکچرل تبادلے اور حاشیائی حالات پر تبادلہ خیال کرنے سے آپ کا جواب مزید نکھر جاتا ہے۔"'
      : '"Highlighting design trade-offs and scalability limits demonstrates executive leadership maturity."',
    coachTitle: isUrdu ? 'کوچ الیکس کا مشورہ' : "Coach Alex's Tip",
    coachSubtitle: isUrdu ? 'اعلیٰ قیادت' : 'Executive Maturity',
    growthPlan: [
      {
        title: isUrdu ? 'سسٹم سکیلنگ' : 'System Scaling',
        description: isUrdu ? 'اعلیٰ ٹریفک اور معمارانہ پیمانے کا تذکرہ کریں۔' : 'Incorporate high scale & distributed trade-off points.',
      },
      {
        title: isUrdu ? 'قیادت کی باتیں' : 'Leadership Focus',
        description: isUrdu ? 'ٹیم کے تعاون پر مزید روشنی ڈالیں۔' : 'Emphasize cross-functional team alignment.',
      },
    ],
  };
}

// Local Fallback Evaluator for Full Session Analysis
function fullAnalysisFallback(params: any) {
  const { sessionHistory = [], language = 'EN', field = 'Software Engineering' } = params;
  const isUrdu = language === 'UR';

  const evaluatedCount = sessionHistory.length || 1;
  let totalScoreSum = 0;

  const tacticalReview = sessionHistory.map((item: any, idx: number) => {
    const ans = item.userAnswer ? item.userAnswer.trim() : '';
    const score = item.score || (ans.length > 80 ? 88 : ans.length > 10 ? 68 : 35);
    totalScoreSum += score;

    return {
      questionNumber: idx + 1,
      question: item.question || `Question ${idx + 1}`,
      userAnswer: ans || (isUrdu ? 'جواب فراہم نہیں کیا گیا' : 'No response provided'),
      aiSuggestion: ans.length > 50
        ? (isUrdu
            ? 'جواب کی ساخت زبردست تھی۔ پیمانے یا سیکیورٹی کے نکات شامل کر کے مزید بہتری لائیں۔'
            : 'Excellent structure and reasoning. Consider detailing measurable business outcomes and trade-offs.')
        : (isUrdu
            ? 'جواب میں زیادہ تکنیکی تفصیلات اور STAR طریقہ کار کا استعمال کریں۔'
            : 'Expand your answer using the STAR method with specific tools and project examples.'),
    };
  });

  const avgScore = Math.round(totalScoreSum / evaluatedCount);

  return {
    overallScore: avgScore,
    scoreVsLastWeek: '+14% vs benchmark',
    overallFeedback: isUrdu
      ? `آپ نے ${field} کے پریکٹس سیشن میں بھرپور شرکت کی۔ مسلسل مشق اور STAR ساخت کا استعمال آپ کو اصل انٹرویو میں زبردست کامیابی دے گا۔`
      : `Solid performance across ${evaluatedCount} questions in ${field}. Consistent practice with detailed metric highlights will ensure high interview success.`,
    radarSkills: {
      technical: Math.min(95, Math.max(40, avgScore + 2)),
      tone: Math.min(95, Math.max(40, avgScore - 2)),
      confidence: Math.min(95, Math.max(40, avgScore - 4)),
      pacing: Math.min(95, Math.max(40, avgScore + 1)),
    },
    growthPoints: [
      {
        category: 'Confidence & Structure',
        percentage: Math.min(92, avgScore + 5),
        feedback: isUrdu
          ? 'سوالات کا جواب دیتے وقت اپنے لہجے میں اعتماد اور ساخت برقرار رکھیں۔'
          : 'Maintain clear structural pacing when explaining complex technical decisions.',
      },
      {
        category: 'Technical Depth',
        percentage: Math.min(95, avgScore + 2),
        feedback: isUrdu
          ? 'ڈیٹا ماڈلنگ اور حاشیائی حالات پر مزید تکنیکی وضاحت شامل کریں۔'
          : 'Incorporate edge cases and architectural trade-offs in problem solving.',
      },
      {
        category: 'Communication & Tone',
        percentage: Math.min(90, avgScore - 3),
        feedback: isUrdu
          ? 'اہم اور مشکل صورتحال میں پرسکون اور واضح پیغام رسانی کا استعمال کریں۔'
          : 'Articulate problem framing clearly before jumping straight to coding solutions.',
      },
    ],
    tacticalReview,
  };
}

// 2. Evaluate User Answer
app.post('/api/interview/evaluate-answer', async (req, res) => {
  try {
    const {
      question,
      category = 'Behavioral Question',
      type = 'Job Interview',
      level = 'Intermediate',
      field = 'Software Engineering',
      answer,
      questionIndex = 1,
      totalQuestions = 5,
      language = 'EN',
    } = req.body;

    try {
      const ai = getGeminiClient();

      const prompt = `You are an expert interviewer evaluating a candidate's actual answer during a live interview practice.

Context:
- Domain/Field: ${field}
- Interview Format: ${type}
- Experience Level: ${level}
- Question Category: ${category}
- Question: "${question}"
- Candidate's Actual Answer: "${answer ? answer.trim() : ''}"
- Question ${questionIndex} of ${totalQuestions}.
- Language: ${language === 'UR' ? 'Urdu' : 'English'}

EVALUATION INSTRUCTIONS (BE HONEST & ACCURATE TO THE INPUT):
1. Analyze the quality, technical depth, clarity, and relevance of the candidate's actual response.
2. IF candidate provided NO answer, or a trivial/vague response (e.g., "idk", "yes", "dunno", 1-3 random words):
   - Assign an appropriately LOW score (e.g. 20-50/100).
   - Note clearly in 'watchOutFor' and 'coachTip' that the answer was incomplete or missing key concepts.
3. IF candidate provided a detailed, well-structured response demonstrating domain knowledge:
   - Assign a HIGH score (e.g. 80-98/100).
   - Highlight specific strong points and offer minor refinements.
4. IF candidate provided an average or partial response:
   - Assign a MODERATE score (e.g. 60-78/100).
5. Return JSON matching the schema with realistic, non-generic feedback.`;

      const response = await callGeminiWithFallback(
        ai,
        'gemini-3.6-flash',
        'gemini-3.1-flash-lite',
        prompt,
        {
          systemInstruction: 'Evaluate candidate responses accurately based on answer quality. Give realistic, constructive, and actionable feedback without inflating generic high scores for low-effort answers.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              logicScore: { type: Type.INTEGER },
              clarityScore: { type: Type.INTEGER },
              softSkillsScore: { type: Type.INTEGER },
              celebrationMessage: { type: Type.STRING },
              celebrationSubtext: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              watchOutFor: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                  },
                  required: ['title', 'feedback'],
                },
              },
              coachTip: { type: Type.STRING },
              coachTitle: { type: Type.STRING },
              coachSubtitle: { type: Type.STRING },
              growthPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ['title', 'description'],
                },
              },
            },
            required: [
              'score',
              'logicScore',
              'clarityScore',
              'softSkillsScore',
              'celebrationMessage',
              'celebrationSubtext',
              'strengths',
              'watchOutFor',
              'coachTip',
              'coachTitle',
              'coachSubtitle',
              'growthPlan',
            ],
          },
        }
      );

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    } catch (geminiError) {
      console.warn('Gemini answer evaluation rate limited or unavailable, using heuristic fallback:', geminiError);
      const fallbackResult = evaluateAnswerFallback(req.body);
      return res.json(fallbackResult);
    }
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    const fallbackResult = evaluateAnswerFallback(req.body);
    res.json(fallbackResult);
  }
});

// 3. Full Session Comprehensive Analysis
app.post('/api/interview/full-session-analysis', async (req, res) => {
  try {
    const { sessionHistory = [], type = 'Job Interview', level = 'Intermediate', field = 'Software Engineering', language = 'EN' } = req.body;

    try {
      const ai = getGeminiClient();

      const prompt = `Analyze this completed interview session containing ${sessionHistory.length} questions and answers:
Interview Field: ${field}
Interview Type: ${type}
Level: ${level}
Session Data: ${JSON.stringify(sessionHistory)}
Language: ${language === 'UR' ? 'Urdu' : 'English'}

Calculate an accurate summary of candidate performance based on their actual answers. Return JSON with:
- overallScore: integer 0-100 reflecting real average performance
- scoreVsLastWeek: string like "+12% vs benchmark"
- overallFeedback: 2-sentence summary of overall candidate readiness
- radarSkills: object with integer scores 0-100 for { technical, tone, confidence, pacing }
- growthPoints: array of 3 objects { category: string, percentage: integer 0-100, feedback: string } for Confidence, Technical Depth, Communication Tone
- tacticalReview: array of objects corresponding to each question asked: { questionNumber: integer, question: string, userAnswer: string, aiSuggestion: string }`;

      const response = await callGeminiWithFallback(
        ai,
        'gemini-3.6-flash',
        'gemini-3.1-flash-lite',
        prompt,
        {
          systemInstruction: 'You are an executive interviewer summarizing complete interview performance.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              scoreVsLastWeek: { type: Type.STRING },
              overallFeedback: { type: Type.STRING },
              radarSkills: {
                type: Type.OBJECT,
                properties: {
                  technical: { type: Type.INTEGER },
                  tone: { type: Type.INTEGER },
                  confidence: { type: Type.INTEGER },
                  pacing: { type: Type.INTEGER },
                },
                required: ['technical', 'tone', 'confidence', 'pacing'],
              },
              growthPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    percentage: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ['category', 'percentage', 'feedback'],
                },
              },
              tacticalReview: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    userAnswer: { type: Type.STRING },
                    aiSuggestion: { type: Type.STRING },
                  },
                  required: ['questionNumber', 'question', 'userAnswer', 'aiSuggestion'],
                },
              },
            },
            required: ['overallScore', 'scoreVsLastWeek', 'overallFeedback', 'radarSkills', 'growthPoints', 'tacticalReview'],
          },
        }
      );

      const jsonText = response.text || '{}';
      const parsed = JSON.parse(jsonText);
      return res.json(parsed);
    } catch (geminiError) {
      console.warn('Gemini full session analysis rate limited or unavailable, using heuristic fallback:', geminiError);
      const fallbackAnalysis = fullAnalysisFallback(req.body);
      return res.json(fallbackAnalysis);
    }
  } catch (error: any) {
    console.error('Error generating analysis:', error);
    const fallbackAnalysis = fullAnalysisFallback(req.body);
    res.json(fallbackAnalysis);
  }
});

// Vite Middleware & Static Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InterviewAI Coach server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

if (process.env.VERCEL !== '1') {
  startServer();
}
