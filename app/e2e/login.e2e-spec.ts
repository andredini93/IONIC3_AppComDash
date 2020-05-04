import { browser, element, by } from 'protractor';
describe('Login Page', () => {
	it('should open Login Page', () => {
		browser.get('');
		browser.getTitle().then(title => expect(title).toEqual('TOTVS Analytics'));
	});
	it('should signin', (done) => {
		browser.driver.sleep(1000);
		let email = getEmailInput();
		email.click();
		browser.driver.sleep(1000);
		email.clear().sendKeys('sydnei.tanikawa@totvs.com.br');

		browser.driver.sleep(200);
		let password = getPasswordInput();
		password.click();
		browser.driver.sleep(1000);
		password.clear().sendKeys('Spfc1935');
		browser.driver.sleep(1000);
		getSubmitButton().click();
		browser.driver.sleep(8000);
		element(by.className('toolbar-title toolbar-title-md')).getText().then(title => {
			expect(title).toEqual('ANALYTICS')
			done();
		});
	});
	it('should load project', () => {
		let projects = element.all(by.tagName('ion-radio'));
		let project = projects.get(0);
		project.click();
		browser.driver.sleep(2000);
		element(by.id('reload')).click();
		browser.waitForAngularEnabled(false);
		browser.driver.sleep(2000);


		let reports = element.all(by.tagName('ion-card'));
		expect(reports.count()).toBeGreaterThan(0);
	});
});
var getEmailInput = function () {
	let inputs = element.all(by.tagName('input'));
	return inputs.get(0);
}
var getPasswordInput = function () {
	let inputs = element.all(by.tagName('input'));
	return inputs.get(1);
}
var getSubmitButton = () => {
	return element(by.id('loginButton'));
}