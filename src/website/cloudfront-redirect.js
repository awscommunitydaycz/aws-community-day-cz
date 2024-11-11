function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var headers = request.headers;
  var host = request.headers.host.value;
  // Redirect www to apex
  if (host.startsWith("www.")) {
    var newurl = host.replace("www.", "");
    var response = {
      statusCode: 302,
      statusDescription: "Found",
      headers: { location: { value: "https://" + newurl + uri } },
    };
    return response;
  }
  // redirect to the correct year
  else if (uri == "/") {
    var response = {
      statusCode: 302,
      statusDescription: "Found",
      headers: { location: { value: "/next/" } },
    };
    return response;
  }
  // Check whether the URI is missing a file name.
  else if (uri.endsWith("/")) {
    request.uri += "index.html";
  }
  // Check whether the URI is missing a file extension.
  else if (!uri.includes(".")) {
    request.uri += "/index.html";
  }
  return request;
}
