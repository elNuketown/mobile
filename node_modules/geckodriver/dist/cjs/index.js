exports.start = async function start(params) {
    const esmPkg = await import('../index.js');
    return esmPkg.start(params);
};
exports.download = async function download(geckodriverVersion, cacheDir) {
    const esmPkg = await import('../index.js');
    return esmPkg.download(geckodriverVersion, cacheDir);
};
//# sourceMappingURL=index.js.map