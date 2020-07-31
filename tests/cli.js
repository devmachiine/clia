module.exports = async ({ test, assert, affirm, alike }) => {

    const cli = require('../index')

    const throws = (f) => {
        const not_thrown = {}
        try {
            f()
            throw not_thrown
        } catch (err) {
            if (err === not_thrown)
                throw Error("did not throw expected error")
            else return err
        }
    }

    const test_err = (description, f, maybe_check = i => i) => test(description, () => {
        const err = throws(f)
        maybe_check(err)
    })

    return [
        test_err("doesn't allow prototype pollution", () => {
            cli([, , '__proto__'])
        })
        , test("no args return empty object", () => {
            alike({}, cli())
        })
        , test("single unflagged arg set in $arr property", () => {
            const single = cli(['there'])
            alike({ $arr: ['there'] }, single)
        })
        , test("multiple unflagged args set in $arr property", () => {
            alike({ $arr: ['one', 'two', 'three'] }, cli(['one', 'two', 'three']))
        })
        , test("letter flag option sets boolean", () => {
            alike({ v: true }, cli(['-v']))
            alike({ v: true, w: true }, cli(['-vw']))
            alike({ a: true, b: true, c: true }, cli(['-ab', '-b', '-c']))
            alike({ a: true, '-': true, '_': true }, cli(['-a-_']))
            alike({ v: true, s: true, $arr: ['lemon'] }, cli(['-v', 'lemon', '-s']))
        })
        , test_err("empty dash throws error", () => {
            cli(['-'])
        })
        , test_err("empty double dash throws error", () => {
            // TODO posix/gnu behaviour here intead.
            cli(['--'])
        })
        , test("word flag sets boolean", () => {
            alike({ verbose: true }, cli(['--verbose']))
            alike({ apple: true, banana: true, c: true, d: true }, cli(['--banana', '--apple', '--c', '-d']))
        })
        , test_err("empty key with word flag throws error", () => {
            cli(['--=val'])
        })
        , test_err("empty value with word flag throws error", () => {
            cli(['--opt='])
        })
        , test("word flag with equals sets string", () => {
            alike({ opt: 'some' }, cli(['--opt=some']))
        })
        , test("last option/flag overrides previous options/flags", () => {
            alike({ rover: true }, cli(['--rover=some', '--rover']))
            alike({ rover: 'mars' }, cli(['--rover', '--rover=mars']))
        })

    ]
}