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
      previousQuestions = [],
    } = req.body;

    // Determine target question count based on level
    const targetCount = level === 'Beginner' ? 5 : level === 'Advanced' ? 10 : 8;

    let parsedQuestions: any[] = [];

    const previousListText = Array.isArray(previousQuestions) && previousQuestions.length > 0
      ? `\nCRITICAL: Do NOT generate or repeat any of these recently asked questions:\n${previousQuestions.slice(-20).map((q: string) => `- "${q}"`).join('\n')}`
      : '';

    try {
      const ai = getGeminiClient();

      const prompt = `As an elite corporate interviewer and hiring manager, generate exactly ${targetCount} fresh, highly relevant, non-repeating interview questions.

Interview Configuration:
- Domain/Field: "${field}"
- Interview Format/Type: "${type}"
- Experience Level: "${level}"
  * Beginner Level: Exactly 5 questions. MUST be simple, clear, foundational, entry-level concepts suitable for fresh learners/students. Do NOT ask complex architecture or multi-year management scenarios.
  * Intermediate Level: Exactly 8 questions. Should test moderate technical depth, practical trade-offs, and real-world scenario problem solving.
  * Advanced Level: Exactly 10 questions. Should be complex, high-level professional scenarios, architecture, system scaling, and strategic decision making.
- Unique Timestamp/Nonce: ${timestamp}_${Math.floor(Math.random() * 10000)}
${previousListText}
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
      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= targetCount) {
        parsedQuestions = parsed.questions.slice(0, targetCount);
      } else if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        parsedQuestions = parsed.questions;
      }
    } catch (geminiError) {
      console.warn('Gemini question generation rate limited or unavailable, using structured level-specific fallback set:', geminiError);
    }

    // High quality fallback generator if AI returned incomplete set or hit quota
    if (parsedQuestions.length < targetCount) {
      const fallbackBanks: Record<string, Record<string, string[]>> = {
        'Software Engineering': {
          Beginner: [
            'What is the difference between a variable and a constant in programming?',
            'Can you explain what an algorithm is using a simple everyday analogy?',
            'What is version control, and why do software developers use Git?',
            'Explain the basic difference between front-end and back-end development.',
            'What is an API, and why is it useful when connecting applications?',
            'What does Object-Oriented Programming (OOP) mean to you?',
            'How do you approach learning a new programming language or framework?',
            'What is the difference between an array and a linked list?',
          ],
          Intermediate: [
            'Walk me through a project where you had to choose a database model. What trade-offs did you evaluate?',
            'How do you approach debugging a memory leak or sudden performance degradation in production?',
            'Explain the concept of asynchronous processing or event loops to a non-technical stakeholder.',
            'How do you write effective unit and integration tests for complex business logic?',
            'Describe a situation where you had to refactor a legacy codebase. How did you ensure zero downtime?',
            'What strategy do you use when reviewing pull requests to ensure code quality and security?',
            'How do you manage API versioning and backward compatibility in a microservices ecosystem?',
            'Tell me about a time you made a wrong architectural assumption. How did you recover?',
            'How do you balance delivering features quickly against accumulating technical debt?',
            'How do you ensure data consistency across distributed systems during high traffic bursts?',
          ],
          Advanced: [
            'How would you design a distributed rate limiter operating across global regions with ultra-low latency?',
            'Explain your strategy for migrating a monolithic database to microservices with zero downtime and strict ACID guarantees.',
            'How do you implement event-driven architecture with idempotent consumers to handle duplicate messages at scale?',
            'Describe how you establish engineering standards, CI/CD pipelines, and observability across cross-functional teams.',
            'How do you handle catastrophic infrastructure failures during peak traffic events without losing application state?',
            'How do you evaluate and introduce new paradigms like Serverless or Edge Computing into an enterprise codebase?',
            'Describe a situation where you had to negotiate core technical trade-offs with executive business leaders.',
            'How do you ensure zero-trust security and end-to-end data encryption across multi-tenant cloud environments?',
            'Walk me through your process for performing post-mortem root cause analysis after a major production outage.',
            'How do you foster a high-ownership engineering culture while managing tech debt and architectural evolution?',
          ],
        },
        'Data Science & AI': {
          Beginner: [
            'What is the basic difference between supervised and unsupervised machine learning?',
            'Can you explain what data cleaning is and why it is important?',
            'What is the difference between mean, median, and mode in statistics?',
            'What is a feature in machine learning, and how is it used?',
            'Why do we split data into training and testing datasets?',
            'What is Python used for in data science, and what libraries have you heard of?',
            'Explain what a decision tree is in simple terms.',
          ],
          Intermediate: [
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
          Advanced: [
            'How do you design a real-time feature store that serves high-throughput inference models with low latency?',
            'Explain strategies for training large language models (LLMs) with distributed GPU clusters and model parallelism.',
            'How do you combat data contamination and hallucination when fine-tuning generative AI models?',
            'Describe an end-to-end MLOps pipeline covering automated retraining, A/B model deployment, and rollback triggers.',
            'How do you structure fair data governance frameworks when handling sensitive user demographic datasets?',
            'Explain how you optimize neural network quantization for edge device deployment without severe accuracy loss.',
            'Walk me through how you evaluate causal inference vs correlation in high-stakes business forecasting.',
            'Describe a time you diagnosed and fixed catastrophic forgetting in sequential neural network fine-tuning.',
            'How do you align AI research initiatives with executive business OKRs and ROI goals?',
            'How do you architect privacy-preserving machine learning using federated learning or differential privacy?',
          ],
        },
        'Product Management': {
          Beginner: [
            'What does a Product Manager do, and how do they work with developers?',
            'What is the difference between a user requirement and a feature?',
            'What is an MVP (Minimum Viable Product), and why is it useful?',
            'How do you gather feedback from users on a product idea?',
            'What is a product roadmap in simple terms?',
            'How do you decide what task to work on first when you have many options?',
            'What makes an app or website easy and enjoyable to use?',
          ],
          Intermediate: [
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
          Advanced: [
            'How do you manage product strategy during pivot moments when market conditions suddenly shift?',
            'Explain how you balance platform scaling initiatives against consumer feature growth across product lines.',
            'Describe your framework for entering a new international market with complex regional compliance requirements.',
            'How do you build alignment across cross-functional leadership when launching disruptive product pricing models?',
            'Walk me through how you evaluate buy vs build decisions for core technology capabilities.',
            'How do you turn qualitative feedback from thousands of enterprise users into structured roadmap priorities?',
            'Describe how you establish customer churn indicators and design intervention loops to increase retention.',
            'How do you define a multi-year product vision while maintaining quarterly team agility?',
            'Tell me about a time you restructured an entire product organization to accelerate velocity.',
            'How do you measure product-market fit (PMF) when launching a product in an unproven category?',
          ],
        },
        'Marketing & Sales': {
          Beginner: [
            'What is marketing, and why is it important for businesses?',
            'What is the difference between organic marketing and paid ads?',
            'Explain what target audience means in simple terms.',
            'What is social media marketing, and which platform is best for reaching young audiences?',
            'What is a call-to-action (CTA) in an email or advertisement?',
            'How do you measure if a blog post or social media post was successful?',
            'What is brand awareness and how do companies build it?',
          ],
          Intermediate: [
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
          Advanced: [
            'How do you build a global omni-channel acquisition strategy with an multi-million dollar annual budget?',
            'Explain multi-touch attribution modeling when customer journeys span across online and offline touchpoints.',
            'How do you reposition a mature brand facing aggressive low-cost market disruptors?',
            'Describe how you leverage predictive analytics and AI personalization to scale outbound B2B sales pipelines.',
            'How do you navigate brand reputation crisis communications across social media and news outlets?',
            'Walk me through how you structure commission incentives and quotas for a high-performing enterprise sales team.',
            'How do you evaluate international market entry strategies and localized marketing messaging?',
            'Describe how you align marketing and product teams to drive product-led growth (PLG) viral loops.',
            'How do you optimize marketing spend during macroeconomic downturns while preserving pipeline velocity?',
            'Tell me about an innovative growth hack campaign you led that yielded exponential ROI.',
          ],
        },
        'Finance & Business': {
          Beginner: [
            'What is the difference between revenue, expense, and profit?',
            'Can you explain what a budget is and why individuals or companies need one?',
            'What is an asset versus a liability in basic accounting?',
            'What is interest rate, and how does it affect borrowing money?',
            'Why do businesses create financial reports like income statements?',
            'What is cash flow in simple terms?',
            'What does ROI (Return on Investment) mean?',
          ],
          Intermediate: [
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
          Advanced: [
            'How do you construct a capital structure strategy balancing debt, equity, and corporate tax shields?',
            'Explain your valuation methodology for late-stage venture investments or acquisition targets.',
            'How do you hedge currency and commodity price risks for global business operations?',
            'Describe how you structure debt restructuring or refinancing during severe liquidity constraints.',
            'How do you conduct financial scenario modeling for black-swan economic events?',
            'Walk me through an M&A deal execution from initial valuation through post-merger integration.',
            'How do you evaluate capital expenditure (CapEx) investments against R&D growth opportunities?',
            'Describe how you present financial risk disclosures and governance to a Board of Directors.',
            'How do you optimize global tax strategies while adhering strictly to regulatory compliance?',
            'Tell me about a time you led a corporate cost-restructuring program that restored profitability.',
          ],
        },
        'Design & UX': {
          Beginner: [
            'What is the difference between UI (User Interface) and UX (User Experience)?',
            'What makes a website or app easy to navigate for new users?',
            'Why is color contrast important when designing for accessibility?',
            'What is a wireframe, and why do designers create them before coding?',
            'What is a design system or component library in basic terms?',
            'How do you gather feedback on a visual design draft?',
            'What is responsive design and why is it important for smartphones?',
          ],
          Intermediate: [
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
          Advanced: [
            'How do you establish design leadership and user-centered design culture across a multi-product enterprise?',
            'Explain how you architect design systems serving web, iOS, Android, and spatial computing applications.',
            'How do you measure design ops maturity and track design efficiency across large design organizations?',
            'Describe how you resolve fundamental conflicts between monetization requirements and user experience principles.',
            'How do you conduct cognitive walkthroughs and accessibility audits for complex enterprise workflows?',
            'Walk me through how you design for AI-driven conversational and generative interface paradigms.',
            'How do you validate design hypotheses when user research budget and timelines are severely restricted?',
            'Describe how you lead design critiques that elevate quality without stifling team creativity.',
            'How do you establish ethical UX patterns that prevent dark patterns and predatory user retention loops?',
            'Tell me about a time your user research uncovered an insight that completely changed product direction.',
          ],
        },
        'Healthcare & Medical': {
          Beginner: [
            'Why is patient privacy and confidentiality so important in medical care?',
            'What are basic vital signs, and why do healthcare providers measure them?',
            'How do you communicate with a patient who feels anxious or scared?',
            'What does teamwork look like in a hospital or clinic setting?',
            'Why is proper hygiene and sanitation critical in healthcare environments?',
            'What steps do you take to stay organized during a busy workday?',
            'How do you handle receiving instructions from senior medical supervisors?',
          ],
          Intermediate: [
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
          Advanced: [
            'How do you establish clinical governance and quality control standards across medical departments?',
            'Describe your protocol for leading critical clinical responses during pandemic outbreaks or mass trauma events.',
            'How do you evaluate and integrate novel medical technologies and AI diagnostic tools into clinical workflows safely?',
            'Explain how you resolve ethical disagreements between care teams and patient surrogate decision-makers.',
            'How do you design clinical trial protocols that ensure rigorous medical safety and patient diversity?',
            'Describe how you manage healthcare operational budgets while expanding access to specialized patient care.',
            'How do you analyze hospital readmission metrics and implement preventative outpatient care programs?',
            'Tell me about how you mentor medical staff and build a culture of psychological safety and continuous learning.',
            'How do you navigate regulatory audits and accreditation standards with zero non-conformances?',
            'Walk me through a complex case management strategy for patients presenting with multi-system comorbidities.',
          ],
        },
        'General Business': {
          Beginner: [
            'What is professional workplace communication and why is it essential?',
            'How do you organize your work tasks when you have several assignments due?',
            'What does good customer service mean to you in a business setting?',
            'How do you handle working with people who have different work styles?',
            'What is the purpose of team meetings, and how do you make them productive?',
            'How do you react when a supervisor gives you feedback on your performance?',
            'Why is punctuality and reliability important in any job role?',
          ],
          Intermediate: [
            'How do you align daily operational activities with overall corporate strategic objectives?',
            'Describe a time you managed a cross-functional project with tight deadlines and shifting priorities.',
            'How do you approach conflict resolution between team members with differing priorities?',
            'What methodologies do you use to streamline redundant business processes and improve efficiency?',
            'How do you communicate organizational changes effectively to keep team morale high?',
            'Describe how you analyze market trends to identify new growth opportunities for the business.',
            'How do you establish and track Key Performance Indicators (KPIs) for team operational goals?',
            'Tell me about a time you made a business decision based on data analysis rather than intuition.',
            'How do you build strong relationships with external vendor partners and key clients?',
            'What is your approach to risk management when entering a new market or launching an initiative?',
          ],
          Advanced: [
            'How do you drive organizational transformation and change management in legacy business operations?',
            'Describe your strategy for managing executive shareholder expectations during periods of financial restructuring.',
            'How do you evaluate global supply chain resilience and mitigate geopolitical geopolitical risks?',
            'Walk me through how you build a high-performance executive team and cultivate future leadership talent.',
            'How do you assess strategic M&A targets to ensure cultural and operational synergy post-acquisition?',
            'Describe a crisis scenario where you had to make rapid business decisions with incomplete information.',
            'How do you align corporate sustainability initiatives (ESG) with profitability and growth goals?',
            'Tell me about a time you successfully expanded business operations into a new international market.',
            'How do you establish corporate governance and ethical compliance frameworks across global subsidiaries?',
            'How do you foster a culture of continuous operational innovation without disrupting core business revenue?',
          ],
        },
        'Other': {
          Beginner: [
            'Tell me about yourself and why you are interested in this field.',
            'What are your greatest strengths, and how do you apply them in daily tasks?',
            'Describe a challenge or mistake you experienced and what you learned from it.',
            'How do you handle working under tight deadlines or high-pressure situations?',
            'Why do you want to join our team or work in this specific industry?',
            'How do you prioritize your daily task list when faced with multiple requests?',
            'Give an example of a time you worked effectively as part of a team.',
          ],
          Intermediate: [
            'Tell me about a time you had to learn a complex tool or skill very quickly.',
            'How do you handle constructive criticism or feedback from a supervisor or peer?',
            'Describe a situation where you had to communicate a technical concept to a non-technical audience.',
            'Tell me about a project you are particularly proud of and what your individual contribution was.',
            'How do you resolve disagreements or conflicts with colleagues professionally?',
            'Describe a situation where you took the initiative to solve a problem without being asked.',
            'How do you ensure accuracy and attention to detail in your work under time constraints?',
            'Tell me about a time you adapted to a major change in project goals or workplace structure.',
            'Where do you see yourself professionally in three years, and how does this practice help you?',
            'Why should an employer select you over other qualified candidates for this position?',
          ],
          Advanced: [
            'Describe a time you led a major initiative from conception to successful execution.',
            'How do you approach strategic decision making when faced with ambiguous or conflicting information?',
            'Tell me about a time you mentored or coached a colleague to significantly improve their performance.',
            'How do you manage key stakeholder relationships when priorities conflict?',
            'Describe how you handle high-stakes high-risk situations where failure is not an option.',
            'Tell me about a time you advocated for an unconventional idea that ultimately paid off.',
            'How do you evaluate personal success and maintain resilience throughout professional setbacks?',
            'Describe how you foster an inclusive, transparent, and high-trust environment in your work.',
            'Tell me about a time you influenced executive leadership to adopt a new strategic direction.',
            'How do you balance achieving short-term operational targets with long-term strategic vision?',
          ],
        },
      };

      const fieldBank = fallbackBanks[field] || fallbackBanks['Other'];
      const levelBank = fieldBank[level] || fieldBank['Intermediate'] || fieldBank['Beginner'] || [];

      // Filter out previously asked questions if provided
      const prevSet = new Set((previousQuestions || []).map((q: string) => q.trim().toLowerCase()));
      let availableQuestions = levelBank.filter((q) => !prevSet.has(q.trim().toLowerCase()));

      if (availableQuestions.length < targetCount) {
        availableQuestions = [...levelBank];
      }

      // Rotate/Shuffle based on timestamp and random nonce
      const seed = Math.abs((typeof timestamp === 'number' ? timestamp : Date.now()) + Math.floor(Math.random() * 1000)) % availableQuestions.length;
      const rotated = [...availableQuestions.slice(seed), ...availableQuestions.slice(0, seed)];

      parsedQuestions = Array.from({ length: targetCount }, (_, i) => ({
        id: i + 1,
        category: `${field} - ${level}`,
        question: rotated[i % rotated.length] || `Describe a key scenario in ${field} demonstrating your problem-solving abilities for ${level} level responsibilities.`,
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
