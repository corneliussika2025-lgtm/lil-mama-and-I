const QUESTIONS = [
["Y1","A LITTLE FLIRTING","Do you secretly smile whenever you see my name pop up on your phone?","yesno"],
["Y2","A LITTLE FLIRTING","Am I your favourite notification?","yesno"],
["Y4","A LITTLE FLIRTING","Would you choose me again if you had to start all over?","yesno"],
["Y6","A LITTLE FLIRTING","Have you ever wanted to kiss me in the middle of a conversation?","yesno"],
["Y9","A LITTLE FLIRTING","Can you imagine growing old with me?","yesno"],
["T1","TRUE OR FALSE","You are one of my favourite people in this entire world.","truefalse"],
["T3","TRUE OR FALSE","I love hearing your voice, even when you have nothing important to say.","truefalse"],
["T5","TRUE OR FALSE","You have a special place in my heart that nobody else can occupy.","truefalse"],
["T7","TRUE OR FALSE","I think about our future together more than you realise.","truefalse"],
["T9","TRUE OR FALSE","I would rather resolve an argument with you than go days without talking.","truefalse"],
["W1","YOUR HEART, YOUR WORDS","What's the first thing you noticed about me?","text"],
["W3","YOUR HEART, YOUR WORDS","What's one thing I do that makes you smile?","text"],
["W5","YOUR HEART, YOUR WORDS","What's one romantic thing you've always wanted us to do?","text"],
["W6","YOUR HEART, YOUR WORDS","What's your favourite memory of us so far?","text"],
["W10","YOUR HEART, YOUR WORDS","Complete this sentence: “I feel most loved by you when…”","text"],
["W12","YOUR HEART, YOUR WORDS","If you had 30 seconds to tell me how you feel about me, what would you say?","text"],
["W13","LET'S TALK ABOUT US — NO JUDGEMENT ZONE","What are some of the things you don't seem to like about me, or things you wish I could improve? Be honest; I promise to listen without getting defensive.","text"],
["W14","LET'S TALK ABOUT US — NO JUDGEMENT ZONE","When we have disagreements or misunderstandings, how would you prefer we settle our differences? What would you want us both to do differently?","text"]
];
const $=id=>document.getElementById(id);
let idx=0, answers={};
const configured=window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL.startsWith("https://") && !window.APP_CONFIG.SUPABASE_URL.includes("PASTE_") && window.APP_CONFIG.SUPABASE_ANON_KEY && !window.APP_CONFIG.SUPABASE_ANON_KEY.includes("PASTE_");
const supabaseClient=configured?window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL,window.APP_CONFIG.SUPABASE_ANON_KEY):null;

function show(id){["welcome","game","done","adminLogin","dashboard"].forEach(x=>$(x).classList.toggle("hide",x!==id));}
function render(){
 const q=QUESTIONS[idx];$("section").textContent=q[1];$("count").textContent=`${idx+1} / ${QUESTIONS.length}`;$("bar").style.width=`${(idx+1)/QUESTIONS.length*100}%`;
 $("kind").textContent=q[3]==="yesno"?"YES OR NO":q[3]==="truefalse"?"TRUE OR FALSE":"YOUR WORDS";$("question").textContent=q[2];
 $("hint").textContent=q[0]==="W13"?"A safe space for honesty. The goal is to understand, not to judge.":q[0]==="W14"?"Tell me what helps you feel heard, respected and loved when things get difficult.":q[3]==="text"?"There is no rush. I really want to hear what you think.":"Choose the answer that feels right.";
 $("choices").innerHTML="";$("typed").classList.toggle("hide",q[3]!=="text");$("typed").value=answers[q[0]]||"";$("typed").oninput=()=>answers[q[0]]=$("typed").value;
 if(q[3]!=="text"){
  (q[3]==="yesno"?["YES","NO"]:["TRUE","FALSE"]).forEach(opt=>{const b=document.createElement("button");b.className="choice"+(answers[q[0]]===opt?" selected":"");b.textContent=opt;
   // The NO button playfully dodges on desktop hover. It remains selectable on touch devices.
   if(q[3]==="yesno"&&opt==="NO"){b.addEventListener("pointerenter",()=>{if(matchMedia("(hover:hover)").matches)b.style.transform=`translate(${(Math.random()-.5)*105}px,${(Math.random()-.5)*48}px)`});b.addEventListener("pointerleave",()=>b.style.transform="");}
   b.addEventListener("click",()=>{answers[q[0]]=opt;[...$("choices").children].forEach(x=>x.classList.toggle("selected",x===b));setTimeout(advance,380)});$("choices").appendChild(b);
  });
 }
 $("next").textContent=idx===QUESTIONS.length-1?"Finish ❤️":"Next 💗";
}
function advance(){const q=QUESTIONS[idx];if(q[3]==="text")answers[q[0]]=$("typed").value.trim();if(!answers[q[0]]){$("hint").textContent="Choose an answer or write a little something before continuing. 💗";return;}if(idx<QUESTIONS.length-1){idx++;render()}else show("done");}
function start(){idx=0;answers={};show("game");render();}
async function submitAnswers(){
 const status=$("sendstatus");status.textContent="";
 if(!supabaseClient){status.textContent="The game owner still needs to finish the Supabase setup. Please try again later.";return;}
 if(QUESTIONS.some(q=>!answers[q[0]]||!String(answers[q[0]]).trim())){status.textContent="Please go back and complete every answer.";return;}
 $("send").disabled=true;status.textContent="Sending your answers securely…";
 const record={answers:answers,submitted_at:new Date().toISOString()};
 const {error}=await supabaseClient.from("game_submissions").insert(record);
 $("send").disabled=false;
 if(error){status.textContent="We couldn't send your answers just now. Please try again.";console.error(error);return;}
 status.textContent="Your answers have been sent. Thank you, baby! ❤️";
}
async function adminLogin(){
 const email=$("adminEmail").value.trim(),password=$("adminPassword").value;
 $("loginStatus").textContent="";
 if(!supabaseClient){$("loginStatus").textContent="The site owner has not finished the Supabase configuration.";return;}
 const {error}=await supabaseClient.auth.signInWithPassword({email,password});
 if(error){$("loginStatus").textContent="Sign-in failed. Check your email and password.";return;}
 await loadDashboard();
}
async function loadDashboard(){
 const {data:{session}}=await supabaseClient.auth.getSession();
 if(!session){show("adminLogin");return;}
 show("dashboard");$("submissions").innerHTML="";$("dashStatus").textContent="Loading submissions…";
 const {data,error}=await supabaseClient.from("game_submissions").select("id,submitted_at,answers").order("submitted_at",{ascending:false});
 if(error){$("dashStatus").textContent="Could not load answers. Check the Supabase table policies.";return;}
 $("dashStatus").textContent=data.length?`${data.length} submission(s) received.`:"No answers yet. Share the game link with her.";
 data.forEach((row,n)=>{const card=document.createElement("article");card.className="submission";const heading=document.createElement("h2");heading.textContent=`Submission ${data.length-n} · ${new Date(row.submitted_at).toLocaleString()}`;card.appendChild(heading);
  QUESTIONS.forEach(q=>{const block=document.createElement("div");block.className="answerblock";const label=document.createElement("b");label.textContent=q[2];const p=document.createElement("p");p.textContent=(row.answers&&row.answers[q[0]])||"No answer";block.append(label,p);card.appendChild(block)});$("submissions").appendChild(card);});
}
async function logout(){if(supabaseClient)await supabaseClient.auth.signOut();show("adminLogin");}
$("start").addEventListener("click",start);$("next").addEventListener("click",advance);$("back").addEventListener("click",()=>{if(idx>0){idx--;render()}else show("welcome")});$("send").addEventListener("click",submitAnswers);$("login").addEventListener("click",adminLogin);$("logout").addEventListener("click",logout);
$("adminLink")?.addEventListener("click",()=>show("adminLogin"));
if(location.hash==="#admin"){show("adminLogin");}
