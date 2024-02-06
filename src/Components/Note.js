import React from 'react';
import './Note.css';

export function Note({ title, content, backgroundColor, fontColor }) {
    const noteStyle = {
        backgroundColor: backgroundColor || '#ffffff',
        color: fontColor || '#000000',
    };

    // async function getImages(){
    //   const { data, error } = await supabase
    //     .storage
    //     .from('Notes')
    //     .list('valentines/',{
    //       limit: 999,
    //       offset: 0,
    //       sortBy: {column: 'name', order: 'asc'}
    //     })
  
    //     if(data!== null) {
    //       setImages(data)
    //     }else{
    //       alert("error loading images")
    //     }
    // }
    return (
        <div className="note" style={noteStyle}>
            <h3>{title}</h3>
            <p>{content}</p>
            
        </div>
    );
}