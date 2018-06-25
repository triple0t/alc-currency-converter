import ApiMain from './ApiMain';

class App extends ApiMain {
    
    init() {
        this.getMyCount();
    }

    getMyCount() {
        /* this.getAllCountries()
        .then(res => {
            console.log('all countries: ', res);
        })
        .catch(err => {
            console.log('err getting countries', err);
        }) */
    }
}

const app = new App();

app.init();