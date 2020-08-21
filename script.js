let artist1 = document.getElementById("artist1");
let artist2 = document.getElementById("artist2");
let submit = document.getElementById("submit");
let output = document.getElementById("output");

const clientId = "4ee414a67b0a40859f8eba7f5617582e";
const clientSecret = "d00458df30c94edcac086987f93cc249";
let token = "";
getToken();
async function getToken() {
  await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  })
    .then((res) => res.json())
    .then((data) => {
      token = data.access_token;
    });
}

submit.addEventListener("click", (e) => {
  e.preventDefault();
  let artist1_id, artist2_id;
  artist1_id = getId(artist1.value);
  artist2_id = getId(artist2.value);
  // console.log(artist1_id,artist2_id);
  // console.log(token)
  // console.log(artist1_id,artist2_id)
  fetchArtist(artist1_id, artist2_id);
});
const getId = (URI) => {
  let count = 0,
    j = 0;
  let id = [];
  for (let i = 0; i < URI.length; i++) {
    if (URI[i] === ":") {
      count++;
    }
    if (count === 2 && URI[i] != ":") {
      id[j] = URI[i];
      j++;
    }
  }
  id = id.toString();
  id = id.replace(/,/g, "");
  return id;
};

async function fetchArtist(id1, id2) {
  await fetch(`https://api.spotify.com/v1/artists?ids=${id1},${id2}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      //   console.log(data)
      getArtist(data.artists);
    });
  await fetch(`https://api.spotify.com/v1/artists/${id1}/related-artists`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      //   console.log(data)
      getRelatedArtist(data.artists, 1);
    });
  await fetch(`https://api.spotify.com/v1/artists/${id2}/related-artists`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log(data)
      getRelatedArtist(data.artists, 2);
    });

  let indirectPath = await commonLink(artist1_info, artist2_info);
  let directPath = await directLink(artist1_info, artist2_info);
  // console.log(indirectPath , directPath)
  if (directPath) {
    // console.log(directPath)
    output.innerHTML = `${artist1_info[0].name} have direct link with ${artist2_info[0].name}`;
  } else {
    // console.log(artists1[0].name,indirectPath,artists2[0].name)
    if (indirectPath == null) {
      output.innerHTML = `${artist1_info[0].name} dont have any connection with ${artist2_info[0].name}`;
    } else {
      output.innerHTML = `<b>${artist1_info[0].name} , ${artist2_info[0].name} linked by ${indirectPath}`;
    }
  }
  console.log(artist1_info, artist2_info);
}

let artist1_info = [];
let artist2_info = [];

const getArtist = (data) => {
  data.forEach((artist, i) => {
    if (i == 0) {
      artist1_info.push({
        name: artist.name,
        image: artist.images[0],
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        spotify: artist.external_urls.spotify,
      });
    } else {
      artist2_info.push({
        name: artist.name,
        image: artist.images[0],
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        spotify: artist.external_urls.spotify,
      });
    }
  });
};

const getRelatedArtist = (data, n) => {
  let related = [];
  data.forEach((artist) => {
    related.push({ name: artist.name, uri: artist.uri });
  });
  if (n == 1) {
    artist1_info.push({ related });
  } else {
    artist2_info.push({ related });
  }
};

const commonLink = (a1, a2) => {
  let commonArtist = [];
  let shortPath = 39;
  let link;
  a1[1].related.forEach((r1, i1) => {
    a2[1].related.forEach((r2, i2) => {
      if (r2.uri == r1.uri) {
        commonArtist.push({
          name: r1.name,
          path: i1 + i2 + 2 , //index1+index2+(adding +1 each)
        });
        // console.log(r1,r2)
      }
    });
  });

  if (commonArtist != null) {
    commonArtist.forEach((ca) => {
      if (ca.path < shortPath) {
        shortPath = ca.path;
        link = ca.name;
        console.log(ca)
      }
    });
    return link;
  } else {
    return null;
  }
};

const directLink = (a1, a2) => {
  let uri1 = a1[0].uri;
  let uri2 = a2[0].uri;
  let count = 0;
  a1[1].related.forEach((a) => {
    if (uri2 == a.uri) {
      count++;
    }
  });
  a2[1].related.forEach((a) => {
    if (uri1 == a.uri) {
      count++;
    }
  });

  if (count > 0) {
    return true;
  } else {
    return false;
  }
};
