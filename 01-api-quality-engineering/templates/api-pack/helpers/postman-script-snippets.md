# Postman Script Snippets

Use these snippets as a starter library. Keep only the ones that match the real API evidence.

## Capture token

```javascript
const data = pm.response.json();
if (data.access_token) {
  pm.environment.set('ACCESS_TOKEN', data.access_token);
}
```

## Capture resource ID

```javascript
const data = pm.response.json();
if (data.id) {
  pm.environment.set('RESOURCE_ID', data.id);
}
```

## Assert status from a small approved set

```javascript
pm.test('status is expected', function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});
```

## Conditionally assert a documented field

```javascript
const data = pm.response.json();
pm.test('response contains name', function () {
  pm.expect(data).to.have.property('name');
});
```
