// js/modules/storage.js
class StorageManager {
    static saveGameData(gameData) {
        localStorage.setItem('volleyballRefereeData', JSON.stringify(gameData));
    }
    
    static loadGameData() {
        const data = localStorage.getItem('volleyballRefereeData');
        return data ? JSON.parse(data) : null;
    }
    
    static clearGameData() {
        localStorage.removeItem('volleyballRefereeData');
    }
}

export default StorageManager;