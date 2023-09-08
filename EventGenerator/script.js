const switchPatterEl = document.getElementById('switch-pattern');
const tabsEl = document.getElementById('tabs');
const boilerplateEl = document.getElementById('boilerplate');

const eventEls = [
	document.getElementById('MouseClick'),
	document.getElementById('MouseMove'),
	document.getElementById('MouseDown'),
	document.getElementById('MouseUp'),
	document.getElementById('MouseEnter'),
	document.getElementById('MouseLeave'),
	document.getElementById('MouseWheel'),
	document.getElementById('KeyDown'),
	document.getElementById('KeyUp'),
	document.getElementById('KeyPress'),
	document.getElementById('WindowMove'),
	document.getElementById('WindowClose')
];

const outputEl = document.getElementById('output');

document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(outputEl.innerText));

const inputElements = [switchPatterEl, tabsEl, boilerplateEl, ...eventEls];

const subscribeToConfigChange = (eventHandler) => {
	inputElements.forEach(e => e.addEventListener('change', eventHandler));
}

const unsubscribeFromConfigChange = (eventHandler) => {
	inputElements.forEach(e => e.removeEventListener('change', eventHandler));
}

const getConfig = () => {
	return {
		useTabs: tabsEl.checked,
		useSwitchPatter: switchPatterEl.checked,
		includeBoilerplate: boilerplateEl.checked,
		events: eventEls.filter(eventEl => eventEl.checked).map(eventEl => eventEl.id)
	};
}

const produceCode = (config) => {
	const code = generateCode(config).join('\n');

	return config.useTabs ? code : code.replaceAll('\t', '    ');
}

const generateCode = (config) => {
	if (config.includeBoilerplate) {
		return generateBoilerplate(config);
	}
	else {
		return generateEvents(config);
	}
}

const generateBoilerplate = (config) => {
	const codeLines = [];

	codeLines.push(`import codedraw.*;`)
	codeLines.push(``);
	codeLines.push(`public class YOUR_CLASS_NAME {`);
	codeLines.push(`\tpublic static void main(String[] args) {`);
	codeLines.push(`\t\tCodeDraw cd = new CodeDraw();`);

	if (!config.useSwitchPatter) {
		codeLines.push(`\t\tEventScanner es = cd.getEventScanner();`);
	}

	codeLines.push(``);
	codeLines.push(`\t\twhile (!cd.isClosed()) {`);
	
	codeLines.push(...generateEvents(config).map(line => '\t\t\t' + line));

	codeLines.push(``);
	codeLines.push(`\t\t\t// Your drawing logic goes here`);
	codeLines.push(``);
	codeLines.push(`\t\t}`);
	codeLines.push(`\t}`);
	codeLines.push(`}`);


	return codeLines;
}

const generateEvents = (config) => {
	return config.useSwitchPatter ? generateSwitchPatternEvents(config) : generateScannerEvents(config);
}

const generateSwitchPatternEvents = (config) => {
	const codeLines = [];
	codeLines.push(`for (var e : cd.getEventScanner()) {`);
	codeLines.push(...generateSwitchPatternEventsBranches(config).map(codeLine => `\t` + codeLine));
	codeLines.push(`}`);
	return codeLines;
}

const generateSwitchPatternEventsBranches = (config) => {
	if (config.events.length === 0) return [];

	const result = [];

	result.push(`switch(e) {`)

	for (let i = 0; i < config.events.length; i++) {
		const eventName = config.events[i];
		result.push(`\tcase ${eventName}Event event -> {`);
		result.push(`\t\t`)
		result.push(`\t}`);
	}

	if (config.events.length > 0) {
		result.push(`\tdefault -> { }`)
	}

	result.push(`}`);

	return result;
}

const generateScannerEvents = (config) => {
	const codeLines = [];
	codeLines.push(`while (es.hasEventNow()) {`);
	codeLines.push(...generateScannerEventsBranches(config).map(codeLine => `\t` + codeLine));
	codeLines.push(`}`);
	return codeLines;
}

const generateScannerEventsBranches = (config) => {
	if (config.events.length === 0) return [];

	const result = [];

	for (let i = 0; i < config.events.length; i++) {
		const eventName = config.events[i];
		if (i === 0) {
			result.push(`if (es.has${eventName}Event()) {`);
		}
		else {
			result.push(`else if (es.has${eventName}Event()) {`);
		}
		result.push(`\t${eventName}Event event = es.next${eventName}Event();`);
		result.push(`}`);
	}

	if (config.events.length > 0) {
		result.push(`else {`);
		result.push(`\tes.nextEvent();`);
		result.push(`}`);
	}

	return result;
}

const setCode = () => {
	const code = produceCode(getConfig());
	outputEl.innerHTML = code;
	Prism.highlightElement(outputEl);
}

subscribeToConfigChange(setCode);
setCode();