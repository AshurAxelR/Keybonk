
const keybonkModeChangeEvent = new Event('keybonkModeChange');

class Keybonk {
	switchTarget(e) {
		if(keybonk.target!=undefined && keybonk.target!=null)
			keybonk.target.classList.remove('keybonk-target');
		keybonk.target = e;
		keybonk.target.classList.add('keybonk-target');
	}

	changeMode(mode) {
		if(this.keybonkMode!=mode) {
			this.keybonkMode = mode;
			for (const k of this.parentDiv.children) {
				k.dispatchEvent(keybonkModeChangeEvent);
			}
		}
	}

	typeCharacter(ch) {
		if(this.target==undefined || this.target==null)
			return;
		this.target.focus();
		
		// Won't work in IE
		const start = this.target.selectionStart;
		const end = this.target.selectionEnd;
		if(typeof start == 'number' && typeof end == 'number') {
			this.target.value = this.target.value.slice(0, start) + ch + this.target.value.slice(end);
			this.target.selectionStart = start+1;
			this.target.selectionEnd = start+1;
		}
	}
	
	typeBackspace() {
		if(this.target==undefined || this.target==null)
			return;
		this.target.focus();
		
		// Won't work in IE
		var start = this.target.selectionStart;
		var end = this.target.selectionEnd;
		if((typeof start)=='number' && (typeof end)=='number') {
			if(end>start) {
				this.target.value = this.target.value.slice(0, start) + this.target.value.slice(end);
				this.target.selectionStart = start;
				this.target.selectionEnd = start;
			}
			else if(start>0) {
				this.target.value = this.target.value.slice(0, start-1) + this.target.value.slice(end);
				this.target.selectionStart = start-1;
				this.target.selectionEnd = start-1;
			}
		}
	}
	
	setKeyActive(key, active) {
		if(active)
			key.classList.add('keybonk-key-active');
		else
			key.classList.remove('keybonk-key-active');
	}

	constructor(parentDiv, target, keyWidth=50, keyMargin=2) {
		if(parentDiv==undefined)
			parentDiv = 'keybonk';
		if((typeof parentDiv)=='string')
			parentDiv = document.getElementById(parentDiv);
		this.parentDiv = parentDiv;
		
		if((typeof target)=='string')
			target = document.getElementById(target);
		this.target = target;
		
		const layout = ['qwertyuiop', 'asdfghjkl', '?zxcvbnm?', '?, .?'];
		const upLayout = ['QWERTYUIOP', 'ASDFGHJKL', '?ZXCVBNM?', '?? !?'];
		const numLayout = ['1234567890', '%$&*-+=()', '??!"\':;/?', '?, .?'];
		const symLayout = ['1234567890', '@#|\u00b0\u00f7\u00d7~[]', '?£\u20ac{}<>\\?', '?? !?'];
		const xoffs = [keyMargin, keyWidth/2+keyMargin, keyMargin, keyMargin];
		
		const kb = this;
		this.totalWidth = keyWidth*10 + keyMargin*20;
		
		for(let row=0; row<layout.length; row++) {
			for(let i=0; i<layout[row].length; i++) {
				let key = document.createElement('div');
				key.classList.add('keybonk-key');
				key.style.margin = keyMargin+'px';
				if(i==0)
					key.style.marginLeft = xoffs[row]+'px';
				
				if(row==2 && i==0) { // shift
					key.style.width = (keyWidth+keyWidth/2)+'px';
					
					key.addEventListener('keybonkModeChange', function() {
						if(kb.keybonkMode=='shift' || kb.keybonkMode=='default')
							key.innerHTML = '&#8679;';
						else
					key.innerHTML = '£#\\';
						kb.setKeyActive(key, kb.keybonkMode=='shift' || kb.keybonkMode=='sym');
					});
					
					key.addEventListener('click', function() {
						if(kb.keybonkMode=='shift')
							kb.changeMode('default');
						else if(kb.keybonkMode=='sym')
							kb.changeMode('num');
						else if(kb.keybonkMode=='num')
							kb.changeMode('sym');
						else
							kb.changeMode('shift');
					});
				}
				
				else if(row==2 && i==layout[row].length-1) { // backspace
					key.innerHTML = '&#129044;';
					key.style.width = (keyWidth+keyWidth/2)+'px';
					key.addEventListener('click', function() {
						kb.typeBackspace(target);
						if(target.value=='')
							kb.changeMode('shift');
					});
				}
				
				else if(row==3 && i==0) { // numeric
					key.style.width = (keyWidth+keyWidth/2)+'px';
					key.innerHTML = '123';
					
					key.addEventListener('keybonkModeChange', function() {
						kb.setKeyActive(key, kb.keybonkMode=='num' || kb.keybonkMode=='sym');
					});
					
					key.addEventListener('click', function() {
						if(kb.keybonkMode=='num' || kb.keybonkMode=='sym')
							kb.changeMode('default');
						else
							kb.changeMode('num');
					});
				}
				
				else if(row==3 && i==2) { // space
					key.style.width = (keyWidth*5+keyMargin*8)+'px';
					key.innerHTML = '&nbsp;';
					key.addEventListener('click', function() {
						kb.typeCharacter(' ');
					});
				}
				
				else if(row==3 && i==layout[row].length-1) { // enter
					key.innerHTML = '&#x21B2;';
					key.style.width = (keyWidth+keyWidth/2)+'px';
					key.addEventListener('click', function() {
						kb.typeCharacter('\n');
					});
				}
				
				else {
					key.ch = layout[row].charAt(i);
					key.upch = upLayout[row].charAt(i);
					key.numch = numLayout[row].charAt(i);
					key.symch = symLayout[row].charAt(i);
					key.style.width = keyWidth+'px'

					key.addEventListener('keybonkModeChange', function() {
						if(kb.keybonkMode=='shift')
							key.innerHTML = this.upch;
						else if(kb.keybonkMode=='num')
							key.innerHTML = this.numch;
						else if(kb.keybonkMode=='sym')
							key.innerHTML = this.symch;
						else
							key.innerHTML = this.ch;
					});
					
					key.addEventListener('click', function() {
						let mode = kb.keybonkMode;
						let ch = this.ch;
						if(mode=='shift') {
							ch = this.upch;
							mode = 'default';
						}
						else if(mode=='num')
							ch = this.numch;
						else if(mode=='sym')
							ch = this.symch;

						kb.typeCharacter(ch);
						
						if(mode!='num' && mode!='sym' && (ch=='.' || ch=='!' || ch=='?')) {
							kb.typeCharacter(' ');
							mode = 'shift';
						}
						
						kb.changeMode(mode);
					});
				}
				
				parentDiv.appendChild(key);
			}
			
			let br = document.createElement('div');
			br.style.cssFloat = 'none';
			br.style.clear = 'both';
			parentDiv.appendChild(br);
		}
		kb.changeMode('shift');
	}
	
}

/*
window.addEventListener('DOMContentLoaded', function() {
	new Keybonk('keybonk');
}, false);
*/
