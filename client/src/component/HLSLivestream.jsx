// src/components/HLSLivestream.js
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import "./HLSLiveStream.css"

const HLSLivestream = () => {
  const videoRef = useRef(null);
  const hls = new Hls();
  const [imageURL, setImageURL] = useState('');
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [rtspURL, setRtspURL] = useState('')
  const [rtspUrlForSetting, setRtspUrlForSetting] = useState('');
  const [position, setPosition] = useState('left-bottom-corner');
  const [key, setKey] = useState(0);
  const [settings, setSettings] = useState([]);
  const [deleteEffect, setDeleteEffect] = useState(0);


  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
  };

  
  const handleImageURL = (e) => {
    setImageURL(e.target.value)
  }

  const handleApplySetting = async(_rtspRL,_imgUrl, _height, _width, _position) => {
    setHeight(_height);
    setWidth(_width);
    setImageURL(_imgUrl);
    setPosition(_position);
    setRtspURL(_rtspRL);
    alert(`Applied overlay setting for ${rtspURL}`)
  }

  const handleGetSetting = async() => {
    try{
      
      const response = await fetch("http://127.0.0.1:5000/stream/allsettings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: rtspUrlForSetting
        }),
      });

        const data = await response.json();
        setSettings(data);
    }catch(err){
      console.log(err);
    }
  }

  const handleRtspUrl = async() => {
    try{
      const response = await fetch("http://127.0.0.1:5000/stream/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: rtspURL
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          setKey((prev) => prev+1);
          console.log("stream connected");
        }, 20000)
      } else {
        console.log("Error", response.statusText);
        
      }

    }catch(err){
      console.log(err);
    }
  }

  const handleUpdateSetting = async (_id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/stream/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          height: height,
          width: width,
          imageUrl: imageURL,
          position: position
        }),
      });

      const data = await response.json();
      
      setDeleteEffect(prev => prev+1);
      alert(`updated overlay setting for ${rtspURL}`)
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteSetting = async(_delete_id) => {
    try{
      const response = await fetch(`http://127.0.0.1:5000/stream/${_delete_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        
      });

        const data = await response.json();
        setDeleteEffect(prev => prev+1);
    }catch(err){
      console.log(err);
    }
  }

  const handleSaveSetting = async() => {
    try{
      if(rtspURL.trim().length == 0  ){
        alert("Must enter rtsp url to save the overlay settings")
      }
      const response = await fetch("http://127.0.0.1:5000/stream/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: rtspURL,
          height: height,
          width: width,
          imageUrl: imageURL,
          position: position
        }),
      });

      
        const data = await response.json();
        alert(`overlay setting saved for the ${rtspURL}`)
    }catch(err){
      console.log(err);
    }
  }

  const imageStyle = {
    width: `${width}px`,
    height: `${height}px`,
  };

  useEffect(() => {
    handleGetSetting();
  }, [deleteEffect]);

  useEffect(() => {
    if (Hls.isSupported()) {
      hls.loadSource(`http://127.0.0.1:5000/stream/output.m3u8`); 
      hls.attachMedia(videoRef.current);
     
    }
  }, [key]);

  return (
    <>
    <div className='navbar'>
      <input className = 'rtsp-input' value = {rtspURL} 
      onChange={(e) => {setRtspURL(e.target.value)}}
      type='text' placeholder='Enter rtsp url'></input>
       <button className='submit-url-btn'  onClick={handleRtspUrl}>Stream</button>
    </div>
      <div className='container'>
      <video ref={videoRef} controls width="100%" height="700px"  />

      <div className={`overlay ${position}`}>
        <div className="image" >
          {imageURL && <img className='logo' style={imageStyle} src={imageURL}  />}
        </div>
      </div>
    </div>
    <div className='bottom-section'>
    <div className = "img-div">
    <div className = "img-div-section">
      <h2>Image URL</h2>
    <input  className='img-url' type='text' value = {imageURL} placeholder = "image url"
      onChange={handleImageURL}
    />
    </div>
    </div>
    
      <div className = "size-div">
      <h2>Position image</h2>
      <div>
      
      <select id="options" value={position} onChange={(e) => handlePositionChange(e.target.value)}>
        
        <option value="left-bottom-corner">Left Bottom corner</option>
        <option value="right-bottom-corner">Right Bottom Corner</option>
        <option value="left-top-corner">Left Top Corner</option>
        <option value="right-top-corner">Right Top corner</option>
      </select>
    </div>
      </div>
      <div className = "postion-div">
      <h2>Resize image</h2>
      <div>
      <input  className="input-hw"  value = {height} onChange = {(e) => {
        setHeight(e.target.value);
      }} type='text' placeholder = "height"/>
      <input   className="input-hw" value = {width} onChange = {(e) => {
        setWidth(e.target.value);
      }} type='text' placeholder = "width"/>   
    </div>
      </div>
      <div className = "buttons-div">
        <button className='btn-set' onClick={handleSaveSetting}>Save settings</button>
        
      </div>
    </div>
    <div className='list-div'>
      <input type = "text" value={rtspUrlForSetting} onChange={(e) => {setRtspUrlForSetting(e.target.value)}} className='input-url-setting' placeholder='Enter rtsp url for saved overlay settings'></input>
      <button className='get-set-btn' onClick={handleGetSetting}>All Settings</button>
      
        <ul>
          {settings.length > 0 ? settings.map((setting) => (
            <li key={setting._id}>
              rtspUrl : {setting.url} 
              <br/>
              height : {setting.height}
              <br/>
              width : {setting.width}
              <br/>
              position : {setting.position}
              <br/>
              {setting.imageUrl && <img className='logo' style={{"width":"60px"}} src={setting.imageUrl}  />}
              <br/>
              <button className='btn-apply' onClick={() => 
              handleApplySetting(setting.url, setting.imageUrl, setting.height, setting.width, setting.position)}>Apply</button>
              <button className='btn-update' onClick={() => handleUpdateSetting(setting._id)}>Update</button>
              <button className='btn-delete' onClick={() => handleDeleteSetting(setting._id)}>Delete</button>
            </li>
          )): <h2>No saved overlays found</h2>}
        </ul>
    </div>
    </>
    

  );
};

export default HLSLivestream;
