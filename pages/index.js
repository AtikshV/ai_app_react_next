import Head from 'next/head'
import Image from 'next/image'
import { Inter, Noto_Color_Emoji, Roboto, Shadows_Into_Light_Two } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState, useEffect, startTransition } from 'react'
import ReactDOM from "react-dom"




import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Modal from "react-modal"
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#454545",
    width: 400,
  },
  overlay: {
    background: "#1C1C1C"
  },
};


// const Dictaphone = () => {
//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition
//   } = useSpeechRecognition();

//   if (!browserSupportsSpeechRecognition) {
//     return <span>Browser doesn't support speech recognition.</span>;
//   }

//   return (
//     <div>
//       <p>Microphone: {listening ? 'on' : 'off'}</p>
//       <button onClick={SpeechRecognition.startListening}>Start</button>
//       <button onClick={SpeechRecognition.stopListening}>Stop</button>
//       <button onClick={resetTranscript}>Reset</button>
//       <p>{transcript}</p>
//     </div>
//   );
  
// };


const inter = Inter({ subsets: ['latin'] })
const local = "http://localhost:3000/"
const vercel = "https://flask-hello-world-ruby-three.vercel.app/GPT_output"


export default function App() {


  const [isPaused, setIsPaused] = useState(false);
  // const [utterance, setUtterance] = useState(null);
  const [message, setMessage] = useState(""); 
  const [text, setText] = useState(""); 
  const [modalOpen, setModalOpen] = useState(false);
  const [loggedIn, setloggedIn] = useState(false)

  //speech recognition code start
  const commands = [
    {
      command: "over",
      callback: (dependency) => handlePlay()
    }
  ]

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });


  const listenStart = () => {
    if(!loggedIn) {
      setModalOpen(true)
    } else {
      console.log("current password:" + localStorage.getItem("pass")+":");
      SpeechRecognition.startListening({continuous:true});
    }
    

  }
  // speech recognition code end

  // text to speech code begin
  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    console.log("UseEffect Log: " + text);

    u.addEventListener("end", (event) => {
      console.log("utterance has ended?");
      resetTranscript(); 
    }) 

    synth.speak(u); 

    return () => {
      synth.cancel();
    };
  }, [text]);

  const handlePlay = async () => {

    console.log(transcript);

    var requestBody = "data="+transcript+ "&pass=" + localStorage.getItem("pass") + "&name=" + localStorage.getItem("name"); //TODO: url encode transcript
    console.log(requestBody)
    const response = await fetch(vercel, {
      method: "POST",
      body: requestBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })

    var data = await response.text()

    // text = data;
    setText(data); 
    // console.log(text);
    // console.log(response.text);
    // console.log(response);
    setMessage(data); 



    // const synth = window.speechSynthesis;
    // console.log(utterance);
    // synth.speak(utterance);

  };

  const handlePause = () => {
    const synth = window.speechSynthesis;
    synth.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPaused(false);
  };
  // text to speach code end


  useEffect(() => {
    //* useEffect only called once on render
    if((localStorage.getItem("pass") == null )|| (localStorage.getItem("pass") == "")) {
      setloggedIn (false);
    } else {
      setloggedIn (true);
    }
  }, []);


  const savePass = () => {
    localStorage.setItem("pass", document.getElementById("password").value);
    localStorage.setItem("name", document.getElementById("name").value);
    setloggedIn(true);
    setModalOpen(false);
    //listenStart();
    SpeechRecognition.startListening({continuous:false});

  }

  const logout = () => {
    localStorage.clear()
    setloggedIn(false)
  }


  return (
    <>
      <Head>
        <title>Andy</title>
        <meta name="description" content="Your friend Andy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
          <button>{listening ? <img src='/micOn.png' width={30}/> : <img src='/micOff.png' width={30}/>}</button>
          { loggedIn ? "Welcome " : ''}
          { loggedIn ? localStorage.getItem("name") + "..." : ''}
          { loggedIn ? <button onClick={logout}> <img src='/logout.png' width={35}/> </button> : '' }      
        </div>

        <div className={styles.center}>
          <Image
            src="/andy.png"
            width={200}
            height={200}
            alt='Andy'
            priority
            className={styles.img}
          />
        </div>
        
        <p className={styles.smallFont}>{transcript}</p>
        <p className={styles.smallFont}>{message}</p> 
        
        <div className={styles.description}>
  
          { listening ? <button onClick={SpeechRecognition.stopListening}><img src='/decline.png' width={60}></img></button> : <button onClick={listenStart} ><img src='/accept.png' width={60}></img></button>  }

        </div>
        
        <Modal isOpen={modalOpen}
            // onRequestClose={() => setModalOpen(false)}
            ariaHideApp={false}
            center
            style={customStyles} >

          <div className={styles.modalForm}>    
            <form>
              <p><label >Name: </label></p>
              <p><input type='text' id='name' name='name'></input> </p>
              <p><label >Password: </label></p> 
              <p><input type='password' id='password' name='password'></input></p>
            </form>
         
              
          <button className={styles.modalBackgroud} onClick={() => savePass()}><img src='/login.png' width={35}></img></button>
          </div>
        </Modal>

      </main>
    </>
  )
}
// ReactDOM.render(<App />, document.getElementById('app'));
{/* <a href="https://www.flaticon.com/free-icons/phone" title="phone icons">Phone icons created by iconmas - Flaticon</a> */}
{/* <a href="https://www.flaticon.com/free-icons/hang-up" title="hang up icons">Hang up icons created by juicy_fish - Flaticon</a> */}

