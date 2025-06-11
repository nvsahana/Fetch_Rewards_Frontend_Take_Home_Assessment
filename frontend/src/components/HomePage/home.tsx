// Note: the emoticons/emojis in this project have been referred and copied from here: https://gist.github.com/roachhd/1f029bd4b50b8a524f3c
import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  fetchDogIds,
  fetchDogsByIds,
  fetchBreeds,
  searchLocations,
  fetchMatch
} from '../../services/dogs';
import './home.css';

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}




const Home: React.FC = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [nextQuery, setNextQuery] = useState<string | null>(null);
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [breedSearch, setBreedSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [favorites, setFavorites] = useState<Dog[]>([]);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [matchDog, setMatchDog] = useState<Dog | null>(null);





  //handling the dropdown display; i.e when to show and when to not show
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowBreedDropdown(false); // 
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

 //useEffect to Load all the breeds that a dog can have from the API given
  useEffect(() => {
    const loadBreeds = async () => {
      try {
        const breedList = await fetchBreeds();
        setBreeds(breedList);
      } catch (err) {
        console.error('Error fetching breeds:', err);
      }
    };
    loadBreeds();
  }, []);

   //Main Logic to get all the dogs
    const loadDogs = async (
    append: boolean = false, //use a append flag to know if we need to append to the dog list  or it's the first time retrieving so no append?
    queryOverrides: object = {},
    zipCodes?: string[],
    sortAscValue: boolean = sortAsc
    ) => {
    setLoading(true);
    try {
        const baseQuery: any = {
        breeds: selectedBreeds.length > 0 ? selectedBreeds : undefined,
        zipCodes: zipCodes?.length ? zipCodes : undefined,
        sort: `breed:${sortAscValue ? 'asc' : 'desc'}`,
        size: 25,
        from: append ? dogs.length : 0, // <-- THIS IS THE CRUCIAL LINE
        ...queryOverrides, //use queryOverrides to let our function know that if there are any extra parameters or conditions, include them too!
        };

        const searchRes = await fetchDogIds(baseQuery);
        const dogData = await fetchDogsByIds(searchRes.resultIds);

        setDogs((prevDogs) => (append ? [...prevDogs, ...dogData] : dogData));
        setNextQuery(dogs.length + searchRes.resultIds.length); // update for next batch
        setTotalCount(searchRes.total ?? 0);
        console.log(totalCount)
    } catch (error) {
        console.error('Error fetching dogs:', error);
    }
    setLoading(false);
    };



useEffect(() => {
  loadDogs(false, {}, undefined, sortAsc);
}, []);


const handleFilterWithSort = async (sortAscValue: boolean = sortAsc) => {
  setLoading(true);
  try {
    let zipCodes: string[] | undefined = undefined;

    if (city.trim() !== '' || state.trim() !== '') { //check if the City or State is typed in by the user
      zipCodes = await searchLocations(city.trim(), state.trim()); //Get the zipcodes for the selected city and state
    }

    await loadDogs(false, {}, zipCodes, sortAscValue); //fetch matching data
  } catch (err) {
    console.error('Filter error:', err);
  }
  setLoading(false);
};



const handleLoadMore = () => {
  loadDogs(true, {}, undefined, sortAsc);
};

const handleBuildMatch = async () => {
  if (favorites.length < 2) return;

  try {
    const matchId = await fetchMatch(favorites.map((d) => d.id));
    const matched = await fetchDogsByIds([matchId]);
    setMatchDog(matched[0]);
    setShowFavorites(false); 
  } catch (err) {
    console.error('Match error:', err);
  }
};

const handleBackToAll = () => {
  setMatchDog(null);
  setShowFavorites(false);
};





  return (
    <div className="home-container">
        <div className="Header-part">
            <header><h1>Adoptable Dogs</h1></header>
        </div>

      <div className='Filter-Section'>
        <div className="filter-bar">
            {/* Breed dropdown with search + checkboxes */}
            <div className="filter-group breed">
                <div className="filter-label">Breed</div>
                <div className="breed-dropdown-container" ref={dropdownRef}>
                <input
                    type="text"
                    placeholder="Enter breed"
                    className="dropdown-search"
                    value={breedSearch}
                    onClick={() => setShowBreedDropdown(true)}
                    onChange={(e) => setBreedSearch(e.target.value)}
                />
                {showBreedDropdown && (
                    <div className="dropdown-menu">
                    {breeds
                        .filter((breed) =>
                        breed.toLowerCase().includes(breedSearch.toLowerCase())
                        )
                        .map((breed) => (
                        <label key={breed} className="checkbox-option">
                            <input
                            type="checkbox"
                            value={breed}
                            checked={selectedBreeds.includes(breed)}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedBreeds((prev) =>
                                e.target.checked
                                    ? [...prev, value]
                                    : prev.filter((b) => b !== value)
                                );
                            }}
                            />
                            {breed}
                        </label>
                        ))}
                    </div>
                )}
                </div>
            </div>

            {/* City Input */}
            <div className="filter-group">
                <div className="filter-label">City</div>
                <input
                type="text"
                placeholder="e.g. New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                />
            </div>

            {/* State Input */}
            <div className="filter-group">
                <div className="filter-label">State</div>
                <input
                type="text"
                placeholder="e.g. NY"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                />
            </div>

            {/* Clear Button */}
            <button
                className="filter-clear"
                onClick={() => {
                setSelectedBreeds([]);
                setBreedSearch('');
                setCity('');
                setState('');
                setSortAsc(true);
                handleFilterWithSort(true);
                }}
            >
                Clear
            </button>

            {/* Search Button */}
            <button className="filter-search" onClick={() => handleFilterWithSort(sortAsc)}>
                Search
            </button>
             <button
                className="sort-toggle"
                onClick={() => {
                const newSort = !sortAsc;
                setSortAsc(newSort);
                handleFilterWithSort(newSort);
                }}
                title={`Sort by name ${sortAsc ? 'descending' : 'ascending'}`}
            >
                Sort(Breed) {sortAsc ? '↓' : '↑'}
            </button>

        </div>
       
     </div>


      {loading ? (
        <p>Loading dogs...</p>
      ) : (
        <>
            <button
        style={{
            backgroundColor: '#F5F5F5',
            color: 'black',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '1rem',
            marginLeft: '3.6em',
        }}
        onClick={() => setShowFavorites((prev) => !prev)}
        >
        {showFavorites ? 'Hide Favorites' : `View Favorites (${favorites.length})`}
    </button>
    {favorites.length >= 2 && (
        <button
            style={{
            backgroundColor: '#F5F5F5',
            color: 'black',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginLeft: '3.2em',
            marginBottom: '1rem',
            marginRight: '1rem',
            }}
            onClick={handleBuildMatch}
        >
            Build Match
        </button>
    )}

    {matchDog && (
        <>
        <div className="dog-grid">
            <div className="dog-card">
            <div className="dog-image-container">
                <img src={matchDog.img} alt={matchDog.name} />
            </div>
            <div className="dog-info">
                <h3>{matchDog.name} 🏆</h3>
                <p>Breed: {matchDog.breed}</p>
                <p>Age: {matchDog.age}</p>
                <p>Zip: {matchDog.zip_code}</p>
            </div>
            </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
            onClick={handleBackToAll}
            style={{
                backgroundColor: '#F5F5F5',
                color: 'black',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
            }}
            >
            ← Back to All Dogs
            </button>
        </div>
  </>
    )}


       <div className="dog-grid">
            {(showFavorites ? favorites : dogs).map((dog) => (
                <div key={dog.id} className="dog-card">
                {/* Hover Overlay */}
                <div className="dog-overlay">
                    {favorites.some(f => f.id === dog.id) ? (
                        <div
                            style={{
                            backgroundColor: 'slategray',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            color: 'white',
                            }}
                        >
                            Added!
                        </div>
                        ) : (
                        <button
                            className={`add-fav-btn ${justAddedId === dog.id ? 'slide' : ''}`}
                            onClick={() => {
                            setJustAddedId(dog.id);
                            setTimeout(() => {
                                setFavorites((prev) => [...prev, dog]);
                            }, 1500); // Delay adding to favorites slightly
                            setTimeout(() => setJustAddedId(null), 1500);

                            }}
                        >
                            {justAddedId === dog.id ? (
                            <>
                                <span style={{ marginRight: '6px' }}>👍</span> {/*Credit: EMoji copied from guthub link mentioned above*/}
                                Added to Favorites
                            </>
                            ) : (
                            '❤️ Add to Favorites' 
                            )}
                        </button>
                    )}


                </div>

                {/* Dog Content */}
                <div className="dog-image-container">
                    <img src={dog.img} alt={dog.name} />
                </div>
                <div className="dog-info">
                    <h3>{dog.name}</h3>
                    <p>Breed: {dog.breed}</p>
                    <p>Age: {dog.age}</p>
                    <p>Zip: {dog.zip_code}</p>
                </div>
                </div>
            ))}
        </div>
        </>
      )}

      {!loading && nextQuery && !showFavorites && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" className="load-more-btn" onClick={handleLoadMore}>
                LOAD MORE
            </button>
        </div>
    )}
    </div>
  );
};

export default Home;
