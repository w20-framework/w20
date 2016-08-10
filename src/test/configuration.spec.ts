import * as Configuration from '../loader/configuration';

describe('The configuration handler', () => {

    let parsedConfiguration:any;

    beforeEach(done => {
        Configuration.loadConfiguration('/base/src/test/fixture/config-test.json').then(configuration => {
            parsedConfiguration = configuration;
            done();
        });
    });

    it('should load and parse configuration from a given path', () => {
       expect(parsedConfiguration).toEqual({
           "some-fragmentId": {
               "some-module": {
                   "some-property": "some-value"
               }
           }
       });
    });
});