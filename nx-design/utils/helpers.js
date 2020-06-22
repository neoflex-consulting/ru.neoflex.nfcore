import React from 'react';

export default function showCode(e) {
    let code = document&&document.querySelector(`pre#${e.target.id}`)
    if (code.style.display === "none") {
        code.style.display = "inline-block";
    }else{
        code.style.display = "none";
    }
}
