import { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  const imageRef = useRef();
  const textInputRef = useRef();
  const fileInputRef = useRef();

  const loadModel = async () => {
    setIsModelLoading(true);
    try {
      const model = await tf.loadLayersModel(
        "https://covidclassifierbucket.s3.eu-central-1.amazonaws.com/tfjs_files/model.json"
      );
      setModel(model);
      setIsModelLoading(false);
    } catch (error) {
      console.log(error);
      setIsModelLoading(false);
    }
  };

  const uploadImage = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageURL(url);
    } else {
      setImageURL(null);
    }
  };

  // const identify = async () => {
  //   textInputRef.current.value = "";
  //   const results = await model.classify(imageRef.current);
  //   setResults(results);
  // };

  const identify = async () => {
    textInputRef.current.value = "";
    const image = tf.browser.fromPixels(imageRef.current, 1);
    const resized_image = tf.image.resizeBilinear(image, [200, 2]);
    const prediction = await model.predict(
      resized_image.reshape([1, 200, 200, 1])
    );
    prediction.data().then((values) => {
      setResults(values[0]);
    });
  };

  const handleOnChange = (e) => {
    setImageURL(e.target.value);
    setResults([]);
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    if (imageURL) {
      setHistory([imageURL, ...history]);
    }
    //eslint-disable-next-line
  }, [imageURL]);

  if (isModelLoading) {
    return <h2>Model Loading...</h2>;
  }

  return (
    <div className="App">
      <h1 className="header">Covid Pneumonia Classifier</h1>
      <div className="inputHolder">
        <input
          type="file"
          accept="image/*"
          capture="camera"
          className="uploadInput"
          onChange={uploadImage}
          ref={fileInputRef}
        />
        <button className="uploadImage" onClick={triggerUpload}>
          Upload Image
        </button>
        <span className="or">OR</span>
        <input
          type="text"
          placeholder="Paster image URL"
          ref={textInputRef}
          onChange={handleOnChange}
        />
      </div>
      <div className="mainWrapper">
        <div className="mainContent">
          <div className="imageHolder">
            {imageURL && (
              <img
                src={imageURL}
                alt="Upload Preview"
                crossOrigin="anonymous"
                ref={imageRef}
              />
            )}
          </div>

          <div className="resultsHolder">
            <div className="result">
              <span className="name"></span>
              <span className="confidence">
                Probability of Covid Pneumonia: {(results * 100).toFixed(2)}%{" "}
                {<span className="bestGuess">Best Approximation</span>}
              </span>
            </div>
          </div>
        </div>

        {imageURL && (
          <button className="button" onClick={identify}>
            Identify Image
          </button>
        )}
      </div>
      {history.length > 0 && (
        <div className="recentPredictions">
          <h2>Recent Images</h2>
          <div className="recentImages">
            {history.map((image, index) => {
              return (
                <div className="recentPrediction" key={`${image}${index}`}>
                  <img
                    src={image}
                    alt="Recent Prediction"
                    onClick={() => setImageURL(image)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// function App() {
//   const [isModelLoading, setIsModelLoading] = useState(false);
//   const [model, setModel] = useState(null);
//   const [imageURL, setImageURL] = useState();
//   //const [results, setresults] = useState();

//   const imageRef = useRef(); //not sure

//   const loadModel = async () => {
//     setIsModelLoading(true);
//     try {
//       const model = await tf.loadLayersModel(
//         "https://covidclassifierbucket.s3.eu-central-1.amazonaws.com/tfjs_files/model.json"
//       );
//       setModel(model);
//       setIsModelLoading(false);
//     } catch (error) {
//       console.log(error);
//       setIsModelLoading(false);
//     }
//   };

//   const uploadImage = (e) => {
//     const { files } = e.target;
//     if (files.length > 0) {
//       const url = URL.createObjectURL(files[0]);
//       setImageURL(url);
//     } else {
//       setImageURL(null);
//     }
//   };

//   const identify = async () => {
//     //textInputRef.current.value = "";
//     const image = tf.browser.fromPixels(imageRef.current, 1);
//     const resized_image = tf.image.resizeBilinear(image, [200, 200]);
//     const prediction = await model.predict(
//       resized_image.reshape([1, 200, 200, 1])
//     );
//     prediction.data().then((values) => {
//       console.log(values[0]);
//     });
//   };

//   useEffect(() => {
//     loadModel();
//   }, []);

//   if (isModelLoading) {
//     return <h2>Model is loading....</h2>;
//   }

//   return (
//     <div className="App">
//       <h1 className="header">Covid Classifier</h1>
//       <div className="inputHolder">
//         <input
//           type="file"
//           accept="image/*"
//           capture="camera"
//           className="uploadImg"
//           onChange={uploadImage}
//         ></input>
//       </div>
//       <div className="imagePreview">
//         <div className="imageHolder">
//           {imageURL && (
//             <img
//               id="loadedimg"
//               src={imageURL}
//               alt="Upload Preview"
//               crossOrigin="anonymous"
//               ref={imageRef}
//             />
//           )}
//         </div>
//         <button className="button" onClick={identify}>
//           Identify Image
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;
