/* eslint-env jest, es6 */

jest
	.unmock('jquery')
	.unmock('../src/dependency')
	.unmock('../src/dependency-set')

const DependencySet = require('../src/dependency-set')

describe('DependencySet', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('should emit a `change` event when all dependencies become qualified', () => {
		document.body.innerHTML =
			'<input id="text-field" type="text">' +
			'<input id="check-field" type="checkbox">'

		const mockHandler = jest.fn()
		const set = new DependencySet({
			'#text-field': {
				values: ['pass']
			},
			'#check-field': {
				checked: true
			}
		})
		const textField = document.getElementById('text-field')
		const checkField = document.getElementById('check-field')

		set.on('change', mockHandler)

		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(1)
		mockHandler.mockClear()

		textField.value = 'pass'
		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(0)

		checkField.setAttribute('checked', true)
		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(1)
		expect(mockHandler.mock.calls[0][0].triggerBy.$ele.selector).toBe('#check-field')
	})

	it('should emit a `change` event when any dependency becomes unqualified', () => {
		document.body.innerHTML =
			'<input id="text-field" type="text" value="pass">' +
			'<input id="check-field" type="checkbox" checked>'

		const mockHandler = jest.fn()
		const set = new DependencySet({
			'#text-field': {
				values: ['pass']
			},
			'#check-field': {
				checked: true
			}
		})
		const textField = document.getElementById('text-field')
		const checkField = document.getElementById('check-field')

		set.on('change', mockHandler)

		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(2)
		expect(mockHandler.mock.calls[1][0].qualified).toBe(true)
		mockHandler.mockClear()

		textField.value = 'fail'
		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(1)
		expect(mockHandler.mock.calls[0][0].qualified).toBe(false)
		expect(mockHandler.mock.calls[0][0].triggerBy.$ele.selector).toBe('#text-field')

		textField.value = 'fail again'
		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(1)

		checkField.removeAttribute('checked')
		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(1)

		textField.value = 'pass'
		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(1)

		checkField.setAttribute('checked', true)
		set.runCheck()
		expect(mockHandler.mock.calls.length).toBe(2)
	})

})
