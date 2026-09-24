// Comprehensive Marathi Transliteration Engine
(function(root) {
  'use strict';

  // सामान्य मराठी प्रथम नावे व आडनावे (Devanagari Dictionary)
  const NAME_DICT = {
    // A
    'aditya': 'आदित्य', 'aaditya': 'आदित्य',
    'aadesh': 'आदेश', 'adesh': 'आदेश',
    'aarti': 'आरती', 'arti': 'आरती',
    'aakash': 'आकाश', 'akash': 'आकाश',
    'anand': 'आनंद', 'aanand': 'आनंद',
    'abhay': 'अभय', 'abhishek': 'अभिषेक',
    'ajit': 'अजित', 'ajeet': 'अजित',
    'ajay': 'अजय', 'akshay': 'अक्षय',
    'amar': 'अमर', 'amit': 'अमित',
    'amol': 'अमोल', 'anil': 'अनिल',
    'anita': 'अनिता', 'ankita': 'अंकिता',
    'aniket': 'अनिकेत', 'anup': 'अनुप',
    'anuradha': 'अनुराधा', 'aparna': 'अपर्णा',
    'archana': 'अर्चना', 'arun': 'अरुण',
    'ashok': 'अशोक', 'ashwini': 'अश्विनी',
    'atul': 'अतुल', 'avinash': 'अविनाश',

    // B
    'balasaheb': 'बाळासाहेब', 'bapu': 'बापू', 'bhau': 'भाऊ',
    'baburao': 'बाबुराव', 'balaji': 'बालाजी',
    'bharat': 'भरत', 'bhaskar': 'भास्कर',
    'bhavana': 'भावना', 'bhushan': 'भूषण',
    'bipin': 'बिपिन',

    // C
    'chaitanya': 'चैतन्य', 'chandrakant': 'चंद्रकांत',
    'chetan': 'चेतन', 'chhaya': 'छाया',

    // D
    'dattatray': 'दत्तात्रय', 'dattatraya': 'दत्तात्रय', 'datta': 'दत्ता',
    'deepak': 'दीपक', 'dipak': 'दीपक',
    'deepali': 'दीपाली', 'dipali': 'दीपाली',
    'deepti': 'दीप्ती', 'dipti': 'दीप्ती',
    'devendra': 'देवेंद्र', 'dhananjay': 'धनंजय',
    'dinesh': 'दिनेश', 'dilip': 'दिलीप',

    // G
    'ganesh': 'गणेश', 'gajanan': 'गजानन',
    'gauri': 'गौरी', 'girish': 'गिरीश',
    'govind': 'गोविंद', 'gopal': 'गोपाल',

    // H
    'harish': 'हरीश', 'harshad': 'हर्षद',
    'hemant': 'हेमंत', 'hitesh': 'हितेश',

    // J
    'jagdish': 'जगदीश', 'jay': 'जय',
    'jayant': 'जयंत', 'jayashree': 'जयश्री',
    'jeevan': 'जीवन', 'jivan': 'जीवन',
    'jyoti': 'ज्योती',

    // K
    'kailas': 'कैलास', 'kailash': 'कैलाश',
    'kalpesh': 'कल्पेश', 'kalyani': 'कल्याणी',
    'kamlesh': 'कमलेश', 'karan': 'करण',
    'kavita': 'कविता', 'kishor': 'किशोर', 'kishore': 'किशोर',
    'krishna': 'कृष्ण', 'kiran': 'किरण',
    'kunal': 'कुणाल',

    // M
    'madhav': 'माधव', 'madhuri': 'माधुरी',
    'mahesh': 'महेश', 'mangesh': 'मंगेश',
    'manisha': 'मनीषा', 'manoj': 'मनोज',
    'maruti': 'मारुती', 'mayur': 'मयूर',
    'meena': 'मीना', 'milind': 'मिलिंद',
    'mohan': 'मोहन', 'mukesh': 'मुकेश',
    'mrunal': 'मृणाल',

    // N
    'nanasaheb': 'नानासाहेब', 'narendra': 'नरेंद्र',
    'naresh': 'नरेश', 'narayan': 'नारायण',
    'navnath': 'नवनाथ', 'neha': 'नेहा',
    'nilesh': 'निलेश', 'nitin': 'नितीन',

    // O, P
    'omkar': 'ओंकार',
    'pallavi': 'पल्लवी', 'pandurang': 'पांडुरंग',
    'pankaj': 'पंकज', 'parag': 'पराग',
    'pooja': 'पूजा', 'puja': 'पूजा',
    'poonam': 'पूनम', 'pradeep': 'प्रदीप',
    'prakash': 'प्रकाश', 'pramod': 'प्रमोद',
    'pranali': 'प्रणाली', 'prasad': 'प्रसाद',
    'prashant': 'प्रशांत', 'pratibha': 'प्रतिभा',
    'pratik': 'प्रतीक', 'pravin': 'प्रवीण', 'praveen': 'प्रवीण',
    'priya': 'प्रिया', 'priyanka': 'प्रियंका',

    // R
    'radha': 'राधा', 'rahul': 'राहुल',
    'raj': 'राज', 'raja': 'राजा',
    'rajan': 'राजन', 'rajendra': 'राजेंद्र',
    'rajesh': 'राजेश', 'rajkumar': 'राजकुमार',
    'rakesh': 'राकेश', 'ram': 'राम',
    'ramdas': 'रामदास', 'ramesh': 'रमेश',
    'rashmi': 'रश्मी', 'ravindra': 'रवींद्र',
    'rekha': 'रेखा', 'renuka': 'रेणुका',
    'rohan': 'रोहन', 'rohit': 'रोहित',
    'rupali': 'रूपाली', 'rutuja': 'ऋतुजा',

    // S
    'sachin': 'सचिन', 'sagar': 'सागर',
    'samir': 'समीर', 'sameer': 'समीर',
    'sandesh': 'संदेश', 'sandeep': 'संदीप', 'sandip': 'संदीप',
    'sangita': 'संगीता', 'sangeeta': 'संगीता',
    'sanjay': 'संजय', 'sanjeev': 'संजीव',
    'santosh': 'संतोष', 'sarita': 'सरिता',
    'sarvesh': 'सर्वेश', 'satish': 'सतीश',
    'saurabh': 'सौरभ', 'sourabh': 'सौरभ',
    'seema': 'सीमा', 'sima': 'सीमा',
    'shail': 'शैल', 'shailesh': 'शैलेश',
    'shankar': 'शंकर', 'shankarrao': 'शंकरराव',
    'shantaram': 'शांताराम', 'sharad': 'शरद',
    'sheetal': 'शीतल', 'shital': 'शीतल',
    'shekhar': 'शेखर', 'shirish': 'शिरीष',
    'shivaji': 'शिवाजी', 'shobha': 'शोभा',
    'shrikant': 'श्रीकांत', 'shubham': 'शुभम',
    'shweta': 'श्वेता', 'siddhesh': 'सिद्धेश',
    'sneha': 'स्नेहा', 'snehal': 'स्नेहल',
    'suhas': 'सुहास', 'sujata': 'सुजाता',
    'sumit': 'सुमित', 'sunil': 'सुनील',
    'sunita': 'सुनिता', 'suneeta': 'सुनीता',
    'suraj': 'सूरज', 'suresh': 'सुरेश',
    'sushant': 'सुशांत', 'suvarna': 'सुवर्णा',
    'swapnil': 'स्वप्निल', 'swati': 'स्वाती',

    // T, U, V, Y
    'tanaji': 'तानाजी', 'tanvi': 'तन्वी',
    'tejas': 'तेजस', 'tukaram': 'तुकाराम',
    'tushar': 'तुषार', 'uday': 'उदय',
    'umesh': 'उमेश', 'urmil': 'उर्मिला', 'urmila': 'उर्मिला',
    'vaibhav': 'वैभव', 'vaishali': 'वैशाली',
    'varsha': 'वर्षा', 'vidya': 'विद्या',
    'vijay': 'विजय', 'vikas': 'विकास', 'vicky': 'विकी',
    'vilas': 'विलास', 'vinayak': 'विनायक',
    'vinod': 'विनोद', 'vipul': 'विपुल',
    'vishal': 'विशाल', 'vishnu': 'विष्णु',
    'vitthal': 'विठ्ठल', 'vivek': 'विवेक',
    'yogesh': 'योगेश', 'yogita': 'योगिता',

    // --- आडनावे (Marathi Surnames) ---
    'patil': 'पाटील', 'nalwade': 'नलावडे', 'nalawade': 'नलावडे',
    'khot': 'खोत', 'pawar': 'पवार', 'deshmukh': 'देशमुख',
    'shinde': 'शिंदे', 'kadam': 'कदम', 'jadhav': 'जाधव',
    'more': 'मोरे', 'bhosale': 'भोसले', 'bhosle': 'भोसले',
    'gaikwad': 'गायकवाड', 'gayakwad': 'गायकवाड',
    'chavan': 'चव्हाण', 'chavhan': 'चव्हाण',
    'mane': 'माने', 'sawant': 'सावंत',
    'koli': 'कोळी', 'thakur': 'ठाकूर',
    'jagtap': 'जगताप', 'tambe': 'तांबे',
    'kurane': 'कुराणे', 'sutar': 'सुतार',
    'lohar': 'लोहार', 'kumbhar': 'कुंभार',
    'sonar': 'सोनार', 'gurav': 'गुरव',
    'mali': 'माळी', 'dhangar': 'धनगर',
    'joshi': 'जोशी', 'kulkarni': 'कुलकर्णी',
    'deshpande': 'देशपांडे', 'patwardhan': 'पटवर्धन',
    'gokhale': 'गोखले', 'ranade': 'रानडे',
    'tilak': 'टिळक', 'apte': 'आपटे',
    'phadke': 'फडके', 'kelkar': 'केळकर',
    'sathe': 'साठे', 'salunkhe': 'साळुंखे',
    'mohite': 'मोहिते', 'ghorpade': 'घोरपडे',
    'shirke': 'शिर्के', 'mahadik': 'महाडिक',
    'surve': 'सुर्वे', 'raut': 'राऊत',
    'naik': 'नाईक', 'nayak': 'नायक',
    'kolhe': 'कोल्हे', 'shelke': 'शेळके',
    'kharat': 'खरात', 'kharate': 'खराटे',
    'baravkar': 'बारवकर', 'waghmare': 'वाघमारे',
    'kamble': 'कांबळे', 'lokhande': 'लोखंडे',
    'sonawane': 'सोनवणे', 'sonwane': 'सोनवणे',
    'bhise': 'भिसे', 'waghmode': 'वाघमोडे',
    'gite': 'गीते', 'doke': 'डोके',
    'ghadge': 'घाडगे', 'shendge': 'शेंडगे',
    'karpe': 'करपे', 'bodke': 'बोडके',
    'narwade': 'नरवाडे', 'choudhari': 'चौधरी',
    'chaudhari': 'चौधरी', 'chaudhary': 'चौधरी',
    'sharma': 'शर्मा', 'verma': 'वर्मा',
    'gupta': 'गुप्ता', 'yadav': 'यादव',
    'singh': 'सिंग', 'kumar': 'कुमार',
    'mote': 'मोटे', 'ingale': 'इंगळे',
    'shewale': 'शेवाळे', 'ingale': 'इंगळे',
    'khandagale': 'खंडागळे', 'wagh': 'वाघ',
    'shete': 'शेटे', 'ghadge': 'घाडगे',
    'babar': 'बाबर', 'borse': 'बोरसे',
    'kale': 'काळे', 'bhide': 'भिडे',
    'godbole': 'गोडबोले', 'pendse': 'पेंडसे',
    'kanitkar': 'कानिटकर', 'limaye': 'लिमये',
    'bapat': 'बापट', 'oak': 'ओक',
    'joshi': 'जोशी', 'dharne': 'धारणे',
    'parab': 'परब', 'pednekar': 'पेडणेकर',
    'bhat': 'भट', 'bhatt': 'भट्ट',
    'dalvi': 'दळवी', 'sawant': 'सावंत',
    'palande': 'पालंदे', 'divekar': 'दिवेकर',
    'nerurkar': 'नेरुरकर', 'vengurlekar': 'वेंगुर्लेकर'
  };

  // Phonetic syllables fallback for names not in dictionary
  const CLUSTERS = [
    { en: 'dny', mr: 'ज्ञ' },
    { en: 'jny', mr: 'ज्ञ' },
    { en: 'ksh', mr: 'क्ष' },
    { en: 'shr', mr: 'श्र' },
    { en: 'chh', mr: 'छ' },
    { en: 'ch', mr: 'च' },
    { en: 'kh', mr: 'ख' },
    { en: 'gh', mr: 'घ' },
    { en: 'jh', mr: 'झ' },
    { en: 'th', mr: 'थ' },
    { en: 'dh', mr: 'ध' },
    { en: 'ph', mr: 'फ' },
    { en: 'bh', mr: 'भ' },
    { en: 'sh', mr: 'श' },
    { en: 'tr', mr: 'त्र' },
    { en: 'pr', mr: 'प्र' },
    { en: 'kr', mr: 'क्र' },
    { en: 'gr', mr: 'ग्र' },
    { en: 'dr', mr: 'द्र' },
    { en: 'br', mr: 'ब्र' },
    { en: 'mr', mr: 'म्र' },
    { en: 'vr', mr: 'व्र' },
    { en: 'sr', mr: 'स्र' },
    { en: 'sw', mr: 'स्व' },
    { en: 'st', mr: 'स्त' },
    { en: 'sp', mr: 'स्प' },
    { en: 'sk', mr: 'स्क' },
    { en: 'sn', mr: 'स्न' },
    { en: 'sm', mr: 'स्म' },
    { en: 'vy', mr: 'व्य' },
    { en: 'ny', mr: 'ण्य' },
    { en: 'ty', mr: 'त्य' },
    { en: 'dy', mr: 'द्य' },
    { en: 'py', mr: 'प्य' },
    { en: 'by', mr: 'ब्य' },
    { en: 'my', mr: 'म्य' },
    { en: 'ly', mr: 'ल्य' }
  ];

  const CONSONANTS = {
    'k': 'क', 'g': 'ग', 'j': 'ज', 't': 'त', 'd': 'द',
    'n': 'न', 'p': 'प', 'b': 'ब', 'm': 'म', 'y': 'य',
    'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 's': 'स',
    'h': 'ह', 'f': 'फ', 'z': 'झ'
  };

  const VOWELS = [
    { en: 'ai', mr: 'ै', init: 'ऐ' },
    { en: 'au', mr: 'ौ', init: 'औ' },
    { en: 'ou', mr: 'ौ', init: 'औ' },
    { en: 'ee', mr: 'ी', init: 'ई' },
    { en: 'oo', mr: 'ू', init: 'ऊ' },
    { en: 'aa', mr: 'ा', init: 'आ' },
    { en: 'a',  mr: 'ा', init: 'अ' },
    { en: 'i',  mr: 'ि', init: 'इ' },
    { en: 'u',  mr: 'ु', init: 'उ' },
    { en: 'e',  mr: 'े', init: 'ए' },
    { en: 'o',  mr: 'ो', init: 'ओ' }
  ];

  function phoneticWord(word) {
    if (!word) return '';
    const str = word.toLowerCase().trim();
    let res = '';
    let i = 0;
    let isStart = true;

    while (i < str.length) {
      if ((str.slice(i, i+2) === 'an' || str.slice(i, i+2) === 'am') && i+2 < str.length && !'aeiou'.includes(str[i+2])) {
        res += (isStart ? 'अं' : 'ं');
        i += 2;
        isStart = false;
        continue;
      }

      let matchedCluster = null;
      for (const c of CLUSTERS) {
        if (str.startsWith(c.en, i)) {
          matchedCluster = c;
          break;
        }
      }

      if (matchedCluster) {
        i += matchedCluster.en.length;
        let nextVowel = null;
        for (const v of VOWELS) {
          if (str.startsWith(v.en, i)) {
            nextVowel = v;
            break;
          }
        }
        if (nextVowel) {
          i += nextVowel.en.length;
          if (nextVowel.en === 'a') {
            res += matchedCluster.mr + (i >= str.length && str.length > 3 ? 'ा' : '');
          } else {
            res += matchedCluster.mr + nextVowel.mr;
          }
        } else {
          res += matchedCluster.mr + (i < str.length ? '्' : '');
        }
        isStart = false;
        continue;
      }

      const ch = str[i];
      if (CONSONANTS[ch]) {
        const cMr = CONSONANTS[ch];
        i++;
        let nextVowel = null;
        for (const v of VOWELS) {
          if (str.startsWith(v.en, i)) {
            nextVowel = v;
            break;
          }
        }
        if (nextVowel) {
          i += nextVowel.en.length;
          if (nextVowel.en === 'a') {
            res += cMr + (i >= str.length && str.length > 3 ? 'ा' : '');
          } else {
            res += cMr + nextVowel.mr;
          }
        } else {
          res += cMr + (i < str.length ? '्' : '');
        }
        isStart = false;
        continue;
      }

      let indVowel = null;
      for (const v of VOWELS) {
        if (str.startsWith(v.en, i)) {
          indVowel = v;
          break;
        }
      }
      if (indVowel) {
        res += isStart ? indVowel.init : indVowel.mr;
        i += indVowel.en.length;
        isStart = false;
        continue;
      }

      res += str[i];
      i++;
      isStart = false;
    }

    return res;
  }

  function toMarathi(text) {
    if (!text || typeof text !== 'string') return '';
    const trimmed = text.trim();
    if (!trimmed) return '';

    // If text already has Devanagari characters, return as is
    if (/[\u0900-\u097F]/.test(trimmed)) {
      return trimmed;
    }

    // Split words
    const words = trimmed.split(/(\s+|[-_/])/);
    return words.map(w => {
      if (!w || /^\s+$/.test(w) || /^[-_/]$/.test(w)) return w;
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (NAME_DICT[clean]) {
        return NAME_DICT[clean];
      }
      return phoneticWord(w);
    }).join('');
  }

  function getMemberMarathiName(member) {
    if (!member) return '';
    if (member.nameMarathi && typeof member.nameMarathi === 'string' && member.nameMarathi.trim()) {
      return member.nameMarathi.trim();
    }
    return toMarathi(member.name || '');
  }

  function getMemberDisplayName(member) {
    if (!member) return '';
    const marathiName = getMemberMarathiName(member);
    const engName = (member.name || '').trim();
    if (!marathiName) return engName;
    if (!engName || marathiName.toLowerCase() === engName.toLowerCase()) return marathiName;
    if (/[\u0900-\u097F]/.test(engName)) return engName;
    return `${marathiName} (${engName})`;
  }

  const helper = {
    toMarathi,
    getMemberMarathiName,
    getMemberDisplayName,
    NAME_DICT
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = helper;
  }
  if (typeof window !== 'undefined') {
    window.marathiHelper = helper;
  }
})(typeof window !== 'undefined' ? window : global);
